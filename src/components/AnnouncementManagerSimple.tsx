import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Announcement } from "@/hooks/useAnnouncements";
import React, { useState, useEffect, useRef } from "react";
import { ImageIcon, X } from "lucide-react";

interface AnnouncementManagerSimpleProps {
  announcements: Announcement[];
  onAnnouncementsChange: (announcements: Announcement[]) => void;
  onAddAnnouncement?: (announcementData: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  onUpdateAnnouncement?: (id: string, updates: Partial<Announcement>) => Promise<boolean>;
  onDeleteAnnouncement?: (id: string) => Promise<boolean>;
  isSupabaseConnected?: boolean;
}

const AnnouncementManagerSimple: React.FC<AnnouncementManagerSimpleProps> = ({
  announcements,
  onAnnouncementsChange,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  isSupabaseConnected = false,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] =
    useState<Announcement | null>(null);
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isDialogOpen) {
      const timeoutId = setTimeout(() => {
        setCurrentAnnouncement(null);
      }, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [isDialogOpen]);

  const resetForm = () => {
    setCurrentAnnouncement(null);
    setSelectedImage(null);
    setImageFile(null);
    setIsDialogOpen(false);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "⚠️ Arquivo muito grande",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setImageFile(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!currentAnnouncement || !currentAnnouncement.title.trim() || !currentAnnouncement.content.trim()) {
      toast({
        title: "⚠️ Campos Obrigatórios",
        description: "Título e conteúdo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const now = new Date();
    let success = false;

    try {
      if (currentAnnouncement.id) {
        // Editar comunicado existente
        if (onUpdateAnnouncement) {
          success = await onUpdateAnnouncement(currentAnnouncement.id, {
            title: currentAnnouncement.title,
            content: currentAnnouncement.content,
            priority: currentAnnouncement.priority,
            image: selectedImage || undefined,
          });
        } else {
          // Fallback para método antigo
          const updatedAnnouncements = announcements.map((ann) =>
            ann.id === currentAnnouncement.id
              ? { ...currentAnnouncement, image: selectedImage || undefined, updatedAt: now.toISOString() }
              : ann
          );
          onAnnouncementsChange(updatedAnnouncements);
          success = true;
          toast({
            title: "✅ Comunicado Atualizado",
            description: `"${currentAnnouncement.title}" foi atualizado com sucesso.`,
          });
        }
      } else {
        // Criar novo comunicado
        if (onAddAnnouncement) {
          success = await onAddAnnouncement({
            title: currentAnnouncement.title,
            content: currentAnnouncement.content,
            priority: currentAnnouncement.priority,
            image: selectedImage || undefined,
            date: now.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
          });
        } else {
          // Fallback para método antigo
          const newAnnouncement: Announcement = {
            ...currentAnnouncement,
            id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            image: selectedImage || undefined,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            date: now.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
          };
          const updatedAnnouncements = [newAnnouncement, ...announcements];
          onAnnouncementsChange(updatedAnnouncements);
          success = true;
          toast({
            title: "✅ Comunicado Criado",
            description: `"${newAnnouncement.title}" foi adicionado com sucesso.`,
          });
        }
      }

      if (success) {
        resetForm();
      }
    } catch (error) {
      console.error('❌ Erro ao salvar comunicado:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    if (isDialogOpen) {
      setIsDialogOpen(false);
      setTimeout(() => {
        setCurrentAnnouncement(announcement);
        setSelectedImage(announcement.image || null);
        setIsDialogOpen(true);
      }, 150);
    } else {
      setCurrentAnnouncement(announcement);
      setSelectedImage(announcement.image || null);
      setIsDialogOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (onDeleteAnnouncement) {
        await onDeleteAnnouncement(id);
      } else {
        // Fallback para método antigo
        const announcementToDelete = announcements.find((ann) => ann.id === id);
        if (announcementToDelete) {
          onAnnouncementsChange(announcements.filter((ann) => ann.id !== id));
          toast({
            title: "🗑️ Comunicado Removido",
            description: `"${announcementToDelete.title}" foi excluído com sucesso.`,
          });
        }
      }
    } catch (error) {
      console.error('❌ Erro ao deletar comunicado:', error);
    }
  };

  const handleCreate = () => {
    setCurrentAnnouncement({
      id: "",
      title: "",
      content: "",
      priority: "baixa",
      date: "",
      createdAt: "",
      updatedAt: ""
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Gerenciador de Comunicados</h2>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isSupabaseConnected
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
          }`}>
            {isSupabaseConnected ? '🌐 Online' : '📱 Offline'}
          </div>
        </div>
        <Button onClick={handleCreate}>Novo Comunicado</Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          ref={dialogContentRef}
          className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700 text-white"
          onInteractOutside={(e) => {
            if (e.target instanceof HTMLElement && e.target.closest('[data-radix-select-content]')) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {currentAnnouncement?.id ? "Editar Comunicado" : "Novo Comunicado"}
            </DialogTitle>
            <DialogDescription>
              {currentAnnouncement?.id 
                ? "Edite as informações do comunicado existente." 
                : "Preencha os campos abaixo para criar um novo comunicado."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <Input
                id="title"
                value={currentAnnouncement?.title || ""}
                onChange={(e) =>
                  setCurrentAnnouncement((prev) =>
                    prev ? { ...prev, title: e.target.value } : null
                  )
                }
                className="col-span-3 bg-gray-700 border-gray-600"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="content" className="text-right pt-2">
                Conteúdo
              </Label>
              <Textarea
                id="content"
                value={currentAnnouncement?.content || ""}
                onChange={(e) =>
                  setCurrentAnnouncement((prev) =>
                    prev ? { ...prev, content: e.target.value } : null
                  )
                }
                className="col-span-3 bg-gray-700 border-gray-600 min-h-[120px]"
                placeholder="Digite o conteúdo do comunicado..."
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Imagem</Label>
              <div className="col-span-3 space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-gray-700 border-gray-600 hover:bg-gray-600"
                  >
                    <ImageIcon size={16} />
                    Selecionar Imagem
                  </Button>
                  {selectedImage && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeImage}
                      className="flex items-center gap-1 bg-red-700 border-red-600 hover:bg-red-600"
                    >
                      <X size={14} />
                      Remover
                    </Button>
                  )}
                </div>
                {selectedImage && (
                  <div className="border border-gray-600 rounded-lg p-2 bg-gray-750">
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="max-w-full h-auto max-h-[200px] rounded object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Prioridade
              </Label>
              <Select
                value={currentAnnouncement?.priority || "baixa"}
                onValueChange={(value) =>
                  setCurrentAnnouncement((prev) =>
                    prev ? { ...prev, priority: value } : null
                  )
                }
              >
                <SelectTrigger className="col-span-3 bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent container={dialogContentRef.current ?? undefined}>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {announcements.map((ann) => (
          <div key={ann.id} className="p-4 bg-gray-800 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">{ann.title}</h3>
                <p className="text-sm text-gray-300 mb-3 whitespace-pre-wrap">{ann.content}</p>
                {ann.image && (
                  <div className="mb-3">
                    <img
                      src={ann.image}
                      alt="Imagem do comunicado"
                      className="max-w-full h-auto max-h-[300px] rounded-lg object-contain border border-gray-600"
                    />
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  <span>Prioridade: {ann.priority}</span> | <span>Data: {ann.date}</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Button variant="outline" size="sm" onClick={() => handleEdit(ann)}>
                  Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(ann.id)}>
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementManagerSimple;