import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CLIENTS, EXERCISES, getExerciseById } from '@/data/exercises';
import type { Client, ExerciseAssignment } from '@/types/exercise';
import { 
  LogOut, 
  Users, 
  Plus, 
  Search, 
  ChevronRight,
  Dumbbell,
  Calendar,
  CheckCircle2,
  Circle,
  X,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminDashboard() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>(CLIENTS);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openClientDetail = (client: Client) => {
    setSelectedClient(client);
    setClientDialogOpen(true);
  };

  const openAssignDialog = (client: Client) => {
    setSelectedClient(client);
    setSelectedExercises([]);
    setAssignmentNotes('');
    setDueDate('');
    setAssignDialogOpen(true);
  };

  const toggleExerciseSelection = (exerciseId: string) => {
    setSelectedExercises(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const assignExercises = () => {
    if (!selectedClient || selectedExercises.length === 0) return;

    const newAssignments: ExerciseAssignment[] = selectedExercises.map(exerciseId => {
      const exercise = getExerciseById(exerciseId)!;
      return {
        id: `assign-${Date.now()}-${exerciseId}`,
        exerciseId,
        clientId: selectedClient.id,
        assignedDate: new Date().toISOString(),
        dueDate: dueDate || undefined,
        notes: assignmentNotes || undefined,
        completed: false,
        exercise,
      };
    });

    const updatedClient = {
      ...selectedClient,
      assignedExercises: [...selectedClient.assignedExercises, ...newAssignments],
    };

    // Update clients array
    const updatedClients = clients.map(c => 
      c.id === selectedClient.id ? updatedClient : c
    );
    setClients(updatedClients);
    setSelectedClient(updatedClient);
    setAssignDialogOpen(false);
  };

  const removeAssignment = (assignmentId: string) => {
    if (!selectedClient) return;

    const updatedClient = {
      ...selectedClient,
      assignedExercises: selectedClient.assignedExercises.filter(a => a.id !== assignmentId),
    };

    const updatedClients = clients.map(c => 
      c.id === selectedClient.id ? updatedClient : c
    );
    setClients(updatedClients);
    setSelectedClient(updatedClient);
  };

  const totalExercises = clients.reduce((sum, c) => sum + c.assignedExercises.length, 0);
  const completedExercises = clients.reduce(
    (sum, c) => sum + c.assignedExercises.filter(e => e.completed).length, 
    0
  );

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#EAF4FA]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2F9BFF] flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[#1A2D3D]">{user?.name}</p>
                <p className="text-xs text-[#6B7C8D]">Physical Therapist</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-[#6B7C8D] hover:text-[#2F9BFF] transition-colors hidden sm:block"
              >
                Back to Website
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-[#6B7C8D] hover:text-red-500 transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl text-[#1A2D3D] mb-2">
            Admin Dashboard
          </h1>
          <p className="text-[#6B7C8D]">
            Manage your clients and assign exercises
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="info-card p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#EAF4FA] flex items-center justify-center">
                <Users className="w-6 h-6 text-[#2F9BFF]" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-[#1A2D3D]">{clients.length}</p>
                <p className="text-sm text-[#6B7C8D]">Total Clients</p>
              </div>
            </div>
          </div>

          <div className="info-card p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#EAF4FA] flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-[#2F9BFF]" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-[#1A2D3D]">{totalExercises}</p>
                <p className="text-sm text-[#6B7C8D]">Exercises Assigned</p>
              </div>
            </div>
          </div>

          <div className="info-card p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-[#1A2D3D]">{completedExercises}</p>
                <p className="text-sm text-[#6B7C8D]">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Clients Section */}
        <div className="info-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="font-heading font-bold text-xl text-[#1A2D3D]">
              Your Clients
            </h2>
            
            {/* Search */}
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7C8D]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#EAF4FA] bg-white focus:border-[#2F9BFF] focus:outline-none"
              />
            </div>
          </div>

          {/* Client List */}
          <div className="space-y-3">
            {filteredClients.map((client) => {
              const completed = client.assignedExercises.filter(e => e.completed).length;
              const total = client.assignedExercises.length;
              const progress = total > 0 ? (completed / total) * 100 : 0;

              return (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 bg-[#F6FBFE] rounded-xl hover:bg-[#EAF4FA] transition-colors"
                >
                  <div 
                    className="flex items-center gap-4 flex-1 cursor-pointer"
                    onClick={() => openClientDetail(client)}
                  >
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                      <User className="w-6 h-6 text-[#2F9BFF]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#1A2D3D]">{client.name}</p>
                      <div className="flex items-center gap-4 text-sm text-[#6B7C8D]">
                        <span className="flex items-center gap-1">
                          <Mail size={12} />
                          {client.email}
                        </span>
                        {client.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={12} />
                            {client.phone}
                          </span>
                        )}
                      </div>
                      {total > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 max-w-[150px] h-2 bg-white rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#2F9BFF] rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#6B7C8D]">
                            {completed}/{total} done
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAssignDialog(client);
                      }}
                      className="p-2 text-[#2F9BFF] hover:bg-[#2F9BFF] hover:text-white rounded-lg transition-colors"
                      title="Assign Exercises"
                    >
                      <Plus size={20} />
                    </button>
                    <ChevronRight className="w-5 h-5 text-[#6B7C8D]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Client Detail Dialog */}
      <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedClient && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">
                  {selectedClient.name}
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="exercises" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="exercises">Exercises</TabsTrigger>
                  <TabsTrigger value="info">Client Info</TabsTrigger>
                </TabsList>

                <TabsContent value="exercises" className="mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[#6B7C8D]">
                      {selectedClient.assignedExercises.filter(e => e.completed).length} of {selectedClient.assignedExercises.length} completed
                    </p>
                    <button
                      onClick={() => {
                        setClientDialogOpen(false);
                        openAssignDialog(selectedClient);
                      }}
                      className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Assign New
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedClient.assignedExercises.length === 0 ? (
                      <p className="text-center text-[#6B7C8D] py-8">
                        No exercises assigned yet.
                      </p>
                    ) : (
                      selectedClient.assignedExercises.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="flex items-start justify-between p-4 bg-[#F6FBFE] rounded-xl"
                        >
                          <div className="flex items-start gap-3">
                            {assignment.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                            ) : (
                              <Circle className="w-5 h-5 text-[#2F9BFF] mt-0.5" />
                            )}
                            <div>
                              <p className="font-medium text-[#1A2D3D]">
                                {assignment.exercise.name}
                              </p>
                              <p className="text-sm text-[#6B7C8D]">
                                {assignment.exercise.category}
                              </p>
                              {assignment.notes && (
                                <p className="text-sm text-amber-600 mt-1">
                                  Note: {assignment.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeAssignment(assignment.id)}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remove assignment"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="info" className="mt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-[#F6FBFE] rounded-xl">
                        <p className="text-sm text-[#6B7C8D]">Email</p>
                        <p className="font-medium text-[#1A2D3D]">{selectedClient.email}</p>
                      </div>
                      <div className="p-4 bg-[#F6FBFE] rounded-xl">
                        <p className="text-sm text-[#6B7C8D]">Phone</p>
                        <p className="font-medium text-[#1A2D3D]">{selectedClient.phone || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-[#F6FBFE] rounded-xl">
                        <p className="text-sm text-[#6B7C8D]">Date of Birth</p>
                        <p className="font-medium text-[#1A2D3D]">
                          {selectedClient.dateOfBirth 
                            ? new Date(selectedClient.dateOfBirth).toLocaleDateString() 
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {selectedClient.condition && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-sm text-[#6B7C8D]">Condition</p>
                        <p className="font-medium text-amber-800">{selectedClient.condition}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Exercise Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              Assign Exercises to {selectedClient?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {/* Exercise Selection */}
            <div className="mb-4">
              <p className="font-medium text-[#1A2D3D] mb-3">Select Exercises</p>
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {EXERCISES.map((exercise) => (
                  <label
                    key={exercise.id}
                    className="flex items-start gap-3 p-3 bg-[#F6FBFE] rounded-xl cursor-pointer hover:bg-[#EAF4FA] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedExercises.includes(exercise.id)}
                      onChange={() => toggleExerciseSelection(exercise.id)}
                      className="mt-1 w-4 h-4 text-[#2F9BFF] rounded border-[#EAF4FA] focus:ring-[#2F9BFF]"
                    />
                    <div>
                      <p className="font-medium text-[#1A2D3D]">{exercise.name}</p>
                      <p className="text-sm text-[#6B7C8D]">{exercise.category}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div className="mb-4">
              <label className="block font-medium text-[#1A2D3D] mb-2">
                <span className="flex items-center gap-2">
                  <Calendar size={16} />
                  Due Date (Optional)
                </span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#EAF4FA] bg-white focus:border-[#2F9BFF] focus:outline-none"
              />
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block font-medium text-[#1A2D3D] mb-2">
                Notes for Patient (Optional)
              </label>
              <textarea
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                placeholder="Add any specific instructions or notes..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[#EAF4FA] bg-white focus:border-[#2F9BFF] focus:outline-none resize-none"
              />
            </div>

            {/* Assign Button */}
            <button
              onClick={assignExercises}
              disabled={selectedExercises.length === 0}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Assign {selectedExercises.length} Exercise{selectedExercises.length !== 1 ? 's' : ''}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
