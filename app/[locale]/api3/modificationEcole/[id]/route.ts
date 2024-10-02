import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 
import bcrypt from 'bcryptjs';

const validatePhoneNumber = (phoneNumber: string) => {
  const phoneRegex = /^(05|06|07|08)\d{8}$/;
  return phoneRegex.test(phoneNumber);
};

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const ecole = await prisma.ecole.findUnique({
      where: { id },
      include: {
        licenseTypes: true,
        vehiclesPerType: true,
        students: true,
        region: true
      }
    });
    if (ecole) {
      return NextResponse.json({ ecole });
    } else {
      return NextResponse.json({ error: 'École non trouvée' }, { status: 404 });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'école:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération de l\'école' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { name, email, phoneNumber, licenseTypes, regionId, password } = await req.json();

  if (!validatePhoneNumber(phoneNumber)) {
    return NextResponse.json({ error: 'Le numéro de téléphone doit être au format 05xxxxxxxx/06xxxxxxxx/07xxxxxxxx/08xxxxxxxx.' }, { status: 400 });
  }

  try {
    let updatedData: any = {
      name,
      // email,
      phoneNumber,
      regionId: regionId ? parseInt(regionId) : undefined, 
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedData.password = hashedPassword;
    }

    const updatedEcole = await prisma.ecole.update({
      where: { id: parseInt(id) },
      data: updatedData,
    });

    const currentLicenseTypes = await prisma.ecole.findUnique({
      where: { id: parseInt(id) },
      include: { licenseTypes: true },
    });

    await prisma.ecole.update({
      where: { id: parseInt(id) },
      data: {
        licenseTypes: {
          disconnect: currentLicenseTypes?.licenseTypes
            .filter((type) => !licenseTypes.includes(type.name))
            .map((type) => ({ id: type.id })),
        },
      },
    });

    const licenseTypeIds = await Promise.all(
      licenseTypes.map(async (name: string) => {
        const licenseType = await prisma.licenseType.findUnique({
          where: { name },
        });
        return licenseType?.id;
      })
    );

    await prisma.ecole.update({
      where: { id: parseInt(id) },
      data: {
        licenseTypes: {
          connect: licenseTypeIds.filter((id) => id !== null).map((id) => ({ id: id! })),
        },
      },
    });

    return NextResponse.json(updatedEcole);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'école:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de l\'école' }, { status: 500 });
  }
}