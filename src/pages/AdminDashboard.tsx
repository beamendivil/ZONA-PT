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
  ,ShieldCheck
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConsentManager } from '@/services/ConsentManager';
import { IntakeDashboardSection } from '@/components/IntakeDashboardSection';

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
  const [, setConsentRefresh] = useState(0);

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

  useEffect(() => {
    const refreshConsents = () => setConsentRefresh((value) => value + 1);
    window.addEventListener('zona-consent-change', refreshConsents);
    return () => window.removeEventListener('zona-consent-change', refreshConsents);
  }, []);

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
    <div className="min-h-screen bg-[#F7F9FC]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
                <User className="h-5 w-5 text-[#2459D3]" />
              </div>
              <div>
                <p className="font-semibold text-[#1A2D3D]">{user?.name}</p>
                <p className="text-xs text-[#6B7C8D]">Physical Therapist</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/pilot-readiness')}
                aria-label="Pilot readiness"
                className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:px-3"
              >
                <ShieldCheck size={17} /> <span className="hidden sm:inline">Pilot readiness</span>
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-[#6B7C8D] hover:text-[#2F9BFF] transition-colors hidden sm:block"
              >
                Back to Website
              </button>
              <button
                onClick={handleLogout}
                aria-label="Sign Out"
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
          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-slate-950">
            Clinician Dashboard
          </h1>
          <p className="text-slate-500">
            Assign a simple plan in minutes and review recovery at a glance.
          </p>
        </div>

        <IntakeDashboardSection />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="info-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                <Users className="h-5 w-5 text-[#2459D3]" />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-slate-950">{clients.length}</p>
                <p className="text-sm text-slate-500">Total Clients</p>
              </div>
            </div>
          </div>

          <div className="info-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                <Dumbbell className="h-5 w-5 text-[#2459D3]" />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-slate-950">{totalExercises}</p>
                <p className="text-sm text-slate-500">Exercises Assigned</p>
              </div>
            </div>
          </div>

          <div className="info-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-slate-950">{completedExercises}</p>
                <p className="text-sm text-slate-500">Completed</p>
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
              const missingConsents = ConsentManager.missing(client.id, client.dryNeedlingAssigned ?? false).length +
                (ConsentManager.getLatest(client.id, 'ambient-recording') ? 0 : 1);

              return (
                <div
                  key={client.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-[#F6FBFE] p-3"
                >
                  <button
                    type="button"
                    className="flex min-h-16 flex-1 items-center gap-4 rounded-xl p-1 text-left focus-visible:outline focus-visible:outline-4 focus-visible:outline-blue-700"
                    onClick={() => openClientDetail(client)}
                  >
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                      <User className="w-6 h-6 text-[#2F9BFF]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#1A2D3D]">{client.name}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#536475]">
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
                      <div className="mt-2 flex flex-wrap gap-2">
                        {missingConsents > 0 ? <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900">{missingConsents} consent{missingConsents === 1 ? '' : 's'} missing</span> : <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-900">Consents complete</span>}
                        {client.recovery.painScore > 3 ? <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-900">Pain alert: {client.recovery.painScore}/10</span> : null}
                        <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-700">{client.recovery.functionalOutcome}: {client.recovery.functionalOutcomeScore}</span>
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
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAssignDialog(client);
                      }}
                      className="min-h-11 min-w-11 rounded-lg p-2 text-blue-700 hover:bg-blue-700 hover:text-white"
                      aria-label={`Assign exercises to ${client.name}`}
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
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="exercises">Exercises</TabsTrigger>
                  <TabsTrigger value="recovery">Recovery</TabsTrigger>
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

                <TabsContent value="recovery" className="mt-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <RecoveryItem label="Routine completion" value={selectedClient.recovery.routineCompletion} />
                    <RecoveryItem label="Pain score / VAS" value={`${selectedClient.recovery.painScore} / 10`} alert={selectedClient.recovery.painScore > 3} />
                    <RecoveryItem label={selectedClient.recovery.functionalOutcome} value={selectedClient.recovery.functionalOutcomeScore} />
                    <RecoveryItem label="Reassessment notes" value={selectedClient.recovery.reassessmentNotes} />
                  </div>
                  <p className="mt-4 text-sm text-slate-600">
                    Outcome options: Timed Up and Go, 30 Second Chair Test, Tinetti, and Lower Extremity Functional Scale.
                  </p>
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
                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="mb-3 font-bold text-[#1A2D3D]">Consent status</p>
                      <ConsentStatus
                        label="Consent to Treat"
                        complete={ConsentManager.isAccepted(selectedClient.id, 'consent-to-treat')}
                      />
                      {selectedClient.dryNeedlingAssigned ? (
                        <ConsentStatus
                          label="Dry Needling"
                          complete={ConsentManager.isAccepted(selectedClient.id, 'dry-needling')}
                        />
                      ) : null}
                      <ConsentStatus
                        label="Ambient Recording"
                        complete={ConsentManager.isAccepted(selectedClient.id, 'ambient-recording')}
                        declined={Boolean(ConsentManager.getLatest(selectedClient.id, 'ambient-recording'))}
                      />
                      {!ConsentManager.isAccepted(selectedClient.id, 'ambient-recording') ? (
                        <p className="mt-3 rounded-lg bg-amber-50 p-2 text-sm text-amber-800">
                          Recording disabled. Use manual note entry.
                        </p>
                      ) : null}
                      {selectedClient.dryNeedlingAssigned && !ConsentManager.isAccepted(selectedClient.id, 'dry-needling') ? (
                        <p className="mt-2 rounded-lg bg-red-50 p-2 text-sm font-semibold text-red-800">
                          Dry needling may not be documented until separate consent is complete.
                        </p>
                      ) : null}
                    </div>
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

function RecoveryItem({ label, value, alert = false }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${alert ? 'bg-red-50 text-red-900' : 'bg-[#F6FBFE]'}`}>
      <p className="text-sm font-medium opacity-70">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}

function ConsentStatus({ label, complete, declined = false }: { label: string; complete: boolean; declined?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
      <span>{label}</span>
      <span className={`font-semibold ${complete ? 'text-emerald-700' : 'text-amber-700'}`}>
        {complete ? '✓ Complete' : declined ? '— Declined' : 'Missing'}
      </span>
    </div>
  );
}
