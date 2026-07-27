import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Trash2, Edit, Plus, Upload, X, Save, AlertCircle, Megaphone, Clock, Calendar, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn, formatDateBR } from '@/lib/utils';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  image?: string;
  createdAt: string;
  updatedAt: string;
  date: string;
}


interface AnnouncementManagerProps {
  announcements: Announcement[];
  onAnnouncementsChange: (announcements: Announcement[]) => boolean;
  className?: string;
}

const AnnouncementManager: React.FC<AnnouncementManagerProps> = ({ 
  announcements, 
  onAnnouncementsChange,
  exportData,
  importData,
  restoreFromBackup,
  resetAnnouncements
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'high' | 'medium' | 'low'
  });
  
  const { toast } = useToast();



  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "⚠️ Campos Obrigatórios",
        description: "Título e conteúdo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    const dateStr = formatDateBR(now);

    if (editingAnnouncement) {
      // Editar comunicado existente
      const updatedAnnouncements = announcements.map(ann => 
        ann.id === editingAnnouncement.id 
          ? { ...ann, ...formData, date: dateStr, updatedAt: now.toISOString() }
          : ann
      );
      const success = onAnnouncementsChange(updatedAnnouncements);
      
      if (success !== false) {
        toast({
          title: "✅ Comunicado Atualizado",
          description: `"${formData.title}" foi atualizado com sucesso.`,
        });
      } else {
        toast({
          title: "❌ Erro ao Atualizar",
          description: "Falha ao salvar as alterações. Tente novamente.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Criar novo comunicado
      const newAnnouncement: Announcement = {
        id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...formData,
        title: formData.title.trim(),
        content: formData.content.trim(),
        date: dateStr,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
      
      const success = onAnnouncementsChange([newAnnouncement, ...announcements]);
      
      if (success !== false) {
        toast({
          title: "✅ Comunicado Criado",
          description: `"${newAnnouncement.title}" foi adicionado com sucesso.`,
        });
      } else {
        toast({
          title: "❌ Erro ao Criar",
          description: "Falha ao salvar o comunicado. Tente novamente.",
          variant: "destructive",
        });
        return;
      }
    }

    // Reset form
      setFormData({ title: '', content: '', priority: 'medium' });
      setEditingAnnouncement(null);
      setIsCreateOpen(false);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority
    });
    setIsCreateOpen(true);
  };

  const handleDelete = (id: string) => {
    const announcementToDelete = announcements.find(ann => ann.id === id);
    const updatedAnnouncements = announcements.filter(ann => ann.id !== id);
    const success = onAnnouncementsChange(updatedAnnouncements);
    
    if (success !== false) {
      toast({
        title: "🗑️ Comunicado Removido",
        description: `"${announcementToDelete?.title || 'Comunicado'}" foi excluído com sucesso.`,
      });
    } else {
      toast({
        title: "❌ Erro ao Excluir",
        description: "Falha ao remover o comunicado. Tente novamente.",
        variant: "destructive",
      });
    }
  };



  const getPriorityLabel = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Média';
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '🟡';
    }
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const getAnimationClass = (index: number) => {
    return `animate-slide-up-delay-${index}`;
  };

  return (
    <Card className="gradient-card shadow-card hover:shadow-hover hover:shadow-glow transition-all duration-500 p-8 group animate-slide-up">
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ 
              background: `linear-gradient(135deg, hsl(var(--announcement-accent) / 0.1) 0%, hsl(var(--announcement-accent) / 0.05) 100%)`,
              border: `1px solid hsl(var(--announcement-accent) / 0.2)`
            }}>
              <Megaphone className="h-6 w-6" style={{ color: 'hsl(var(--announcement-accent))' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-card-foreground mb-4">Comunicados Torp</h2>
              <p className="text-sm text-muted-foreground">
                {announcements.length} comunicado{announcements.length !== 1 ? 's' : ''} ativo{announcements.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Controles de Visualização */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllAnnouncements(!showAllAnnouncements)}
              className="gap-1 px-2 py-1 text-xs"
            >
              {showAllAnnouncements ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showAllAnnouncements ? 'Menos' : 'Todos'}
            </Button>
          </div>
        </div>
      </div>


      
      {/* Lista de Comunicados */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum comunicado encontrado</h3>
            <p className="text-muted-foreground">
              Não há comunicados recentes para exibir.
            </p>
          </div>
        ) : (
          (showAllAnnouncements ? announcements : announcements.slice(0, 4)).map((announcement, index) => (
            <div key={announcement.id} 
                 className={`group/item p-5 rounded-xl gradient-secondary hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-border ${getAnimationClass(index)}`}>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start gap-3">
                  <h3 className="font-bold text-secondary-foreground text-lg group-hover/item:text-foreground transition-colors line-clamp-2">
                    {announcement.title}
                  </h3>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs font-semibold px-2 py-1 shadow-sm flex-shrink-0 ${getPriorityColor(announcement.priority)}`}
                  >
                    {getPriorityIcon(announcement.priority)} {getPriorityLabel(announcement.priority)}
                  </Badge>
                </div>
                <div className="text-muted-foreground leading-relaxed text-sm">
                  <p className={`whitespace-pre-wrap ${expandedItems.has(index) ? "" : "line-clamp-3"}`}>
                    {announcement.content}
                  </p>
                  {announcement.content.length > 150 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(index)}
                      className="mt-2 h-auto p-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {expandedItems.has(index) ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" />
                          Ler menos
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          Continue lendo
                        </>
                      )}
                    </Button>
                  )}
                </div>
                {announcement.image && (
                  <img
                    src={announcement.image}
                    alt={`Imagem da notícia: ${announcement.title}`}
                    loading="lazy"
                    className="max-h-80 w-full rounded-lg border border-border/50 bg-muted/20 object-contain"
                  />
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-muted-foreground font-medium bg-muted/30 px-2 py-1 rounded-lg">
                    {announcement.date}
                  </span>
                  {announcement.updatedAt && announcement.updatedAt !== announcement.createdAt && (
                    <span className="text-xs text-muted-foreground font-medium">
                      Editado
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default AnnouncementManager;
