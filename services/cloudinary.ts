// services/cloudinary.ts – Integração com Cloudinary para foto de perfil
// Cada upload usa um public_id único (uid_timestamp) para que a nova foto substitua
// a anterior no uso e a URL guardada no Firestore seja sempre a última.
import { auth } from './firebase';

const CLOUDINARY_CLOUD_NAME = 'dlo35elbt';
const CLOUDINARY_UPLOAD_PRESET = 'avatars_preset';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Faz upload da imagem para o Cloudinary.
 * Usa public_id único por upload (avatars/{uid}_{timestamp}) para que cada nova
 * foto seja um recurso novo e a URL guardada no perfil seja sempre a correta.
 * Assim, ao trocar de foto, a variável avatarUrl no Firestore é atualizada
 * para a nova URL e o perfil mostra sempre a última foto.
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Utilizador não autenticado');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Apenas imagens são permitidas');
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('Imagem muito grande. Máximo 5MB');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  // URL única por upload: ao mudar de foto, guardamos sempre uma nova URL no perfil
  formData.append('public_id', `avatars/${user.uid}_${Date.now()}`);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err?.error?.message || 'Erro ao fazer upload';
    throw new Error(msg);
  }

  const data = await response.json();
  const url = data.secure_url || data.url;
  if (!url) {
    throw new Error('Resposta do Cloudinary sem URL');
  }

  return url;
};

/**
 * Remove o avatar: faz upload de uma imagem 1x1 transparente com um public_id
 * novo, para que o perfil possa guardar essa URL (ou o front pode passar a
 * guardar null e não mostrar imagem).
 */
export const removeAvatar = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Utilizador não autenticado');
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.clearRect(0, 0, 1, 1);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });

  if (!blob) {
    throw new Error('Erro ao criar imagem');
  }

  const formData = new FormData();
  formData.append('file', blob, 'transparent.png');
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('public_id', `avatars/${user.uid}_${Date.now()}`);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    throw new Error('Erro ao remover avatar');
  }
};
