'use client'; 

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { Edit, Search } from 'react-feather';
import { ChevronDownIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

type Ville = {
  name: string;
};

type Ecole = {
  name: string;
};

type Etudiant = {
  id: number;
  username: string;
  email: string;
  number: string;
  birthdate: string;
  drivingLicenseType: string;
  ville?: Ville;
  ecole?: Ecole;
  createdAt: string;
  seancesPratique: number;
};

const ListeEtudiantsPage = () => {
  const { id } = useParams();
  const [students, setStudents] = useState<Etudiant[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Etudiant[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchStudents = async () => {
      try {
        const response = await axios.get('/api2/dashboard_ecole/etudiants', {
          headers: {
            'school-id': id,
          },
        });
        setStudents(response.data.students);
        setFilteredStudents(response.data.students);
      } catch (err) {
        console.log(err);
        setError('Erreur lors de la récupération des étudiants');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [id]);

  const handleDeleteClick = (id: number) => {
    setStudentToDelete(id);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (studentToDelete !== null) {
      try {
        await axios.delete(`/api2/dashboard_ecole/etudiants/${studentToDelete}/suppression`);
        setStudents(students.filter(student => student.id !== studentToDelete));
        setFilteredStudents(filteredStudents.filter(student => student.id !== studentToDelete));
        alert('Étudiant dissocié de l\'école avec succès.');
      } catch (err) {
        console.error(err);
        alert('Erreur lors de la dissociation de l\'étudiant.');
      } finally {
        setStudentToDelete(null);
        setOpenConfirm(false);
      }
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered = students.filter(student =>
        student.username.toLowerCase().startsWith(term) ||
        student.email.toLowerCase().startsWith(term) ||
        student.number.toLowerCase().startsWith(term) ||
        student.ville?.name.toLowerCase().startsWith(term) ||
        student.drivingLicenseType.toLowerCase().startsWith(term)
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <div className="flex min-h-screen bg-white-100">
        <main className="flex-1 p-6">
          <Card className="w-full bg-white shadow-xl rounded-lg flex flex-col">
            <CardContent className="p-6 flex-1">
              <h2 className="text-3xl font-bold text-center text-black mb-6">Liste des Étudiants</h2>
              
              <div className="relative w-full mb-6">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </span>
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Rechercher (par nom, numéro, ville, email, permis) ..."
                  className="pl-10 w-full"
                />
              </div>
              
              {filteredStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg shadow-sm">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold">Nom</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold hidden md:table-cell">Email</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold hidden lg:table-cell">Numéro</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold hidden xl:table-cell">Date de naissance</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold hidden xl:table-cell">Ville</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold hidden xl:table-cell">Permis</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold hidden xl:table-cell">Nbr de séance pratique </th>
                        <th className="py-3 px-4 text-left text-sm font-semibold sticky right-0 bg-gray-100">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((etudiant) => (
                        <tr key={etudiant.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                          <td className="py-4 px-4 text-gray-800">{etudiant.username}</td>
                          <td className="py-4 px-4 text-gray-800 hidden md:table-cell">{etudiant.email}</td>
                          <td className="py-4 px-4 text-gray-800 hidden lg:table-cell">{etudiant.number}</td>
                          <td className="py-4 px-4 text-gray-800 hidden xl:table-cell">{new Date(etudiant.birthdate).toLocaleDateString()}</td>
                          <td className="py-4 px-4 text-gray-800 hidden xl:table-cell">{etudiant.ville?.name || 'Non spécifié'}</td>
                          <td className="py-4 px-4 text-gray-800 hidden xl:table-cell">{etudiant.drivingLicenseType}</td>
                          <td className="py-4 px-4 text-gray-800 hidden xl:table-cell text-center">{etudiant.seancesPratique}</td>
                          <td className="py-4 px-4 text-gray-800">
                            <Menu as="div" className="relative">
                              <div>
                                <Menu.Button className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white pt-3 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 hover:ring-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                  Actions
                                  <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                                </Menu.Button>
                              </div>
                              <MenuItems className="absolute right-0 top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                <MenuItem>
                                  {({ active }) => (
                                    <Link
                                      href={`/fr/ecole/${id}/edit-etudiant/${etudiant.id}`}
                                      className={`block rounded-md items-center w-full px-4 py-2 text-sm text-center ${active ? 'bg-indigo-500 text-white' : 'text-gray-900'}`}
                                    >
                                      Modifier
                                    </Link>
                                  )}
                                </MenuItem>
                                <MenuItem>
                                  {({ active }) => (
                                    <button
                                      className={`block rounded-md w-full items-center px-4 py-2 text-sm ${active ? 'bg-indigo-500 text-white' : 'text-gray-900'}`}
                                      onClick={() => handleDeleteClick(etudiant.id)}
                                    >
                                      Supprimer
                                    </button>
                                  )}
                                </MenuItem>
                              </MenuItems>
                            </Menu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-xl font-medium text-gray-600">Aucun étudiant trouvé.</p>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>Confirmation de suppression</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Êtes-vous sûr de vouloir supprimer cet étudiant ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)} color="primary">
              Annuler
            </Button>
            <Button onClick={handleConfirmDelete} color="secondary">
              Supprimer
            </Button>
          </DialogActions>
      </Dialog>
    </>
  );
};

export default ListeEtudiantsPage;