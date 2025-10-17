import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Save, FolderOpen, Trash2, Eye, Calendar, Code } from 'lucide-react';
import type { FileModel } from '@/types/collaboration';

interface Project {
  id: string;
  title: string;
  language: string;
  code: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface ProjectManagerProps {
  currentFile?: FileModel;
  onLoadProject?: (code: string, language: string) => void;
}

const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
];

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  currentFile,
  onLoadProject
}) => {
  const { user, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'my-projects' | 'public'>('my-projects');
  
  // Save form state
  const [saveForm, setSaveForm] = useState({
    title: '',
    description: '',
    language: currentFile?.language || 'javascript',
    isPublic: false
  });

  // Load user projects
  const loadProjects = async (publicOnly = false) => {
    if (!isAuthenticated && !publicOnly) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (publicOnly) {
        query = query.eq('is_public', true);
      } else {
        query = query.eq('user_id', user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error('Failed to load projects:', error);
      toast({
        title: 'Failed to load projects',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Save current project
  const saveProject = async () => {
    if (!isAuthenticated || !currentFile) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to save projects',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          user_id: user?.id,
          title: saveForm.title || `${saveForm.language} Project`,
          language: saveForm.language,
          code: currentFile.content,
          description: saveForm.description,
          is_public: saveForm.isPublic
        });

      if (error) throw error;

      toast({
        title: 'Project saved successfully',
        description: `"${saveForm.title || `${saveForm.language} Project`}" has been saved to your projects.`
      });

      setSaveForm({ title: '', description: '', language: currentFile.language, isPublic: false });
      setShowSaveDialog(false);
      loadProjects(false);
    } catch (error: any) {
      console.error('Failed to save project:', error);
      toast({
        title: 'Failed to save project',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load project
  const loadProject = (project: Project) => {
    if (onLoadProject) {
      onLoadProject(project.code, project.language);
    }
    setShowLoadDialog(false);
    toast({
      title: 'Project loaded',
      description: `"${project.title}" has been loaded into the editor.`
    });
  };

  // Delete project
  const deleteProject = async (projectId: string, title: string) => {
    if (!isAuthenticated) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Project deleted',
        description: `"${title}" has been deleted.`
      });

      loadProjects(activeTab === 'public');
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      toast({
        title: 'Failed to delete project',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (currentFile) {
      setSaveForm(prev => ({ ...prev, language: currentFile.language }));
    }
  }, [currentFile]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLanguageLabel = (lang: string) => {
    return languageOptions.find(l => l.value === lang)?.label || lang;
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">Sign in to save/load projects</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Save Project Button */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogTrigger asChild>
          <PrimaryButton variant="ghost" size="sm" className="flex items-center space-x-2">
            <Save size={16} />
            <span>Save</span>
          </PrimaryButton>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                placeholder="My Awesome Project"
                value={saveForm.title}
                onChange={(e) => setSaveForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={saveForm.language} onValueChange={(value) => setSaveForm(prev => ({ ...prev, language: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe your project..."
                value={saveForm.description}
                onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={saveForm.isPublic}
                onChange={(e) => setSaveForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="w-4 h-4"
              />
              <Label htmlFor="isPublic" className="text-sm">
                Make this project public
              </Label>
            </div>

            <PrimaryButton
              onClick={saveProject}
              disabled={loading || !currentFile}
              className="w-full"
            >
              {loading ? 'Saving...' : 'Save Project'}
            </PrimaryButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Project Button */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogTrigger asChild>
          <PrimaryButton 
            variant="ghost" 
            size="sm" 
            className="flex items-center space-x-2"
            onClick={() => {
              setShowLoadDialog(true);
              loadProjects(activeTab === 'public');
            }}
          >
            <FolderOpen size={16} />
            <span>Load</span>
          </PrimaryButton>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Load Project</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={(value: any) => {
            setActiveTab(value);
            loadProjects(value === 'public');
          }} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="my-projects">My Projects</TabsTrigger>
              <TabsTrigger value="public">Public Projects</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-projects" className="flex-1 mt-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Loading your projects...</p>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8">
                    <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No projects saved yet</p>
                    <p className="text-sm text-muted-foreground">Save your first project to get started!</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {projects.map((project) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-4 border border-border rounded-lg hover:bg-surface-secondary transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium text-foreground truncate">{project.title}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {getLanguageLabel(project.language)}
                              </Badge>
                              {project.is_public && (
                                <Badge variant="default" className="text-xs">
                                  <Eye size={12} className="mr-1" />
                                  Public
                                </Badge>
                              )}
                            </div>
                            {project.description && (
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {project.description}
                              </p>
                            )}
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar size={12} className="mr-1" />
                              {formatDate(project.updated_at)}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <PrimaryButton
                              size="sm"
                              variant="ghost"
                              onClick={() => loadProject(project)}
                              className="flex items-center space-x-1"
                            >
                              <FolderOpen size={14} />
                              <span>Load</span>
                            </PrimaryButton>
                            <PrimaryButton
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteProject(project.id, project.title)}
                              className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </PrimaryButton>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="public" className="flex-1 mt-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Loading public projects...</p>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No public projects found</p>
                    <p className="text-sm text-muted-foreground">Check back later for community projects!</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {projects.map((project) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-4 border border-border rounded-lg hover:bg-surface-secondary transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium text-foreground truncate">{project.title}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {getLanguageLabel(project.language)}
                              </Badge>
                              <Badge variant="default" className="text-xs">
                                <Eye size={12} className="mr-1" />
                                Public
                              </Badge>
                            </div>
                            {project.description && (
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {project.description}
                              </p>
                            )}
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar size={12} className="mr-1" />
                              {formatDate(project.updated_at)}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <PrimaryButton
                              size="sm"
                              variant="ghost"
                              onClick={() => loadProject(project)}
                              className="flex items-center space-x-1"
                            >
                              <FolderOpen size={14} />
                              <span>Load</span>
                            </PrimaryButton>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};