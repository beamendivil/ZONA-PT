import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getClientByEmail } from '@/data/exercises';
import type { ExerciseAssignment, Client } from '@/types/exercise';
import { 
  LogOut, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ChevronRight,
  User,
  Dumbbell,
  AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ClientDashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseAssignment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.email) {
      const clientData = getClientByEmail(user.email);
      if (clientData) {
        setClient(clientData);
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openExerciseDetail = (assignment: ExerciseAssignment) => {
    setSelectedExercise(assignment);
    setDialogOpen(true);
  };

  const completedCount = client?.assignedExercises.filter(e => e.completed).length || 0;
  const totalCount = client?.assignedExercises.length || 0;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (!client) {
    return (
      <div className="min-h-screen bg-[#EAF4FA] flex items-center justify-center">
        <div className="text-[#6B7C8D]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAF4FA]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2F9BFF] flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[#1A2D3D]">{client.name}</p>
                <p className="text-xs text-[#6B7C8D]">Patient</p>
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl text-[#1A2D3D] mb-2">
            Your Care Plan
          </h1>
          <p className="text-[#6B7C8D]">
            Complete your assigned exercises to support your recovery
          </p>
        </div>

        {/* Progress Overview */}
        <div className="info-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#EAF4FA] flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-[#2F9BFF]" />
              </div>
              <div>
                <p className="font-semibold text-[#1A2D3D]">Exercise Progress</p>
                <p className="text-sm text-[#6B7C8D]">{completedCount} of {totalCount} completed</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-heading font-bold text-2xl text-[#2F9BFF]">
                {Math.round(progressPercentage)}%
              </p>
            </div>
          </div>
          <div className="w-full h-3 bg-[#EAF4FA] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#2F9BFF] rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Condition Info */}
        {client.condition && (
          <div className="flex items-start gap-3 mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Your Treatment Focus</p>
              <p className="text-sm text-amber-700">{client.condition}</p>
            </div>
          </div>
        )}

        {/* Exercise List */}
        <div>
          <h2 className="font-heading font-bold text-xl text-[#1A2D3D] mb-4">
            Your Exercises
          </h2>

          <div className="grid gap-4">
            {client.assignedExercises.map((assignment) => (
              <div
                key={assignment.id}
                onClick={() => openExerciseDetail(assignment)}
                className="info-card p-5 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {assignment.completed ? (
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#EAF4FA] flex items-center justify-center">
                        <Circle className="w-5 h-5 text-[#2F9BFF]" />
                      </div>
                    )}
                  </div>

                  {/* Exercise Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-[#1A2D3D] text-lg">
                          {assignment.exercise.name}
                        </h3>
                        <p className="text-sm text-[#6B7C8D] mt-1 line-clamp-2">
                          {assignment.exercise.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#6B7C8D] flex-shrink-0" />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className="tag text-xs">
                        {assignment.exercise.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[#6B7C8D]">
                        <Clock size={12} />
                        {assignment.exercise.frequency}
                      </span>
                      {assignment.dueDate && (
                        <span className="flex items-center gap-1 text-xs text-[#6B7C8D]">
                          <Calendar size={12} />
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {assignment.notes && (
                      <p className="mt-3 text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
                        <span className="font-medium">Note:</span> {assignment.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Exercise Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedExercise && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">
                  {selectedExercise.exercise.name}
                </DialogTitle>
              </DialogHeader>

              <div className="py-4">
                <p className="text-[#6B7C8D] mb-6">
                  {selectedExercise.exercise.description}
                </p>

                {/* Exercise Details */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {selectedExercise.exercise.duration && (
                    <div className="p-3 bg-[#EAF4FA] rounded-lg">
                      <p className="text-xs text-[#6B7C8D] uppercase tracking-wide">Duration</p>
                      <p className="font-medium text-[#1A2D3D]">{selectedExercise.exercise.duration}</p>
                    </div>
                  )}
                  {selectedExercise.exercise.reps && (
                    <div className="p-3 bg-[#EAF4FA] rounded-lg">
                      <p className="text-xs text-[#6B7C8D] uppercase tracking-wide">Repetitions</p>
                      <p className="font-medium text-[#1A2D3D]">{selectedExercise.exercise.reps}</p>
                    </div>
                  )}
                  {selectedExercise.exercise.sets && (
                    <div className="p-3 bg-[#EAF4FA] rounded-lg">
                      <p className="text-xs text-[#6B7C8D] uppercase tracking-wide">Sets</p>
                      <p className="font-medium text-[#1A2D3D]">{selectedExercise.exercise.sets}</p>
                    </div>
                  )}
                  <div className="p-3 bg-[#EAF4FA] rounded-lg">
                    <p className="text-xs text-[#6B7C8D] uppercase tracking-wide">Frequency</p>
                    <p className="font-medium text-[#1A2D3D]">{selectedExercise.exercise.frequency}</p>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-6">
                  <h4 className="font-semibold text-[#1A2D3D] mb-3">Instructions</h4>
                  <ol className="space-y-2">
                    {selectedExercise.exercise.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#2F9BFF] text-white text-sm flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-[#1A2D3D]">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Notes */}
                {selectedExercise.notes && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                    <p className="font-medium text-amber-800 mb-1">From your therapist:</p>
                    <p className="text-amber-700">{selectedExercise.notes}</p>
                  </div>
                )}

                {/* Mark Complete Button */}
                <button
                  onClick={() => {
                    selectedExercise.completed = !selectedExercise.completed;
                    if (selectedExercise.completed) {
                      selectedExercise.completedDate = new Date().toISOString();
                    } else {
                      selectedExercise.completedDate = undefined;
                    }
                    setDialogOpen(false);
                    // Force re-render
                    setClient({ ...client });
                  }}
                  className={`w-full py-4 rounded-xl font-semibold transition-all ${
                    selectedExercise.completed
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-[#2F9BFF] text-white hover:bg-[#1a8aee]'
                  }`}
                >
                  {selectedExercise.completed ? 'Mark as Not Complete' : 'Mark as Complete'}
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
