import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const validatePassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, city, phoneNumber, licenseTypes, vehiclesPerType } = await request.json();

    console.log('Request Data:', { name, email, password, city, phoneNumber, licenseTypes, vehiclesPerType });

    const validLicenseTypes = Array.isArray(licenseTypes) ? licenseTypes.filter(id => id !== undefined) : [];
    console.log('Valid License Types:', validLicenseTypes);

    const existingLicenseTypes = await prisma.licenseType.findMany({
      where: {
        id: {
          in: validLicenseTypes
        }
      }
    });

    const existingLicenseTypeIds = existingLicenseTypes.map(type => type.id);
    const invalidLicenseTypes = validLicenseTypes.filter(id => !existingLicenseTypeIds.includes(id));

    if (invalidLicenseTypes.length > 0) {
      return NextResponse.json({
        error: `Les types de permis suivants ne sont pas valides : ${invalidLicenseTypes.join(', ')}`
      }, { status: 400 });
    }

    const cityData = await prisma.ville.findUnique({
      where: { name: city }, 
      include: { region: true } 
    });

    if (!cityData) {
      return NextResponse.json({
        error: `La ville ${city} n'existe pas.`
      }, { status: 400 });
    }

    const regionId = cityData.regionId;

    if (!regionId) {
      return NextResponse.json({
        error: `La ville ${city} n'est associée à aucune région.`
      }, { status: 400 });
    }

    const validVehiclesPerType = Array.isArray(vehiclesPerType) ? vehiclesPerType.filter(vehicle => 
      vehicle && vehicle.licenseTypeId !== undefined && vehicle.count !== undefined && vehicle.vehicleType !== undefined && vehicle.ecoleId !== undefined
    ) : [];
    console.log('Valid Vehicles Per Type:', validVehiclesPerType);

    const vehiclesToCreate = validVehiclesPerType.length > 0 ? validVehiclesPerType : [];

    if (!validatePassword(password)) {
      return NextResponse.json({
        error: 'Le mot de passe doit contenir au moins 8 caractères, une lettre majuscule, une lettre minuscule et un chiffre.'
      }, { status: 400 });
    }
    const existingEtudiant = await prisma.etudiant.findUnique({
      where: { email },
    });

    const existingCommercial = await prisma.commercial.findUnique({
      where: { email },
    });

    const existingAutoEcole = await prisma.ecole.findUnique({
      where: { email },
    });

    if (existingEtudiant || existingCommercial || existingAutoEcole) {
      return NextResponse.json({
        error: 'Cet email est déjà utilisé.',
      }, { status: 400 });
      
    }

    const saltRounds = 10; 
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newEcole = await prisma.ecole.create({
      data: {
        name,
        email,
        password: hashedPassword, 
        city,
        phoneNumber,
        regionId, 
        licenseTypes: {
          connect: validLicenseTypes.map(id => ({ id }))
        },
        vehiclesPerType: {
          create: vehiclesToCreate.map(vehicle => ({
            licenseTypeId: vehicle.licenseTypeId,
            count: vehicle.count,
            vehicleType: vehicle.vehicleType,
            ecoleId: vehicle.ecoleId
          }))
        }
      }
    });

    console.log('New Ecole Created:', newEcole);

    return NextResponse.json(newEcole);
  } catch (error) {
    console.error('Erreur lors de la création de l\'école:', error);
    return NextResponse.json({ error: 'Une erreur est survenue lors de la création de l\'école.' }, { status: 500 });
  }
}