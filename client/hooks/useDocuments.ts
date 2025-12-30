import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, getApiUrl } from '@/lib/query-client';

export interface UserDocument {
  id: string;
  userId: string;
  documentType: 'drivers_license' | 'insurance_card' | 'proof_of_identity';
  documentData: string | null;
  fileName: string | null;
  mimeType: string | null;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  reviewNotes: string | null;
  expiryDate: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

export function useUserDocuments(userId: string | null) {
  return useQuery<UserDocument[]>({
    queryKey: ['/api/user', userId, 'documents'],
    enabled: !!userId,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      userId: string;
      documentType: 'drivers_license' | 'insurance_card' | 'proof_of_identity';
      documentData: string;
      fileName: string;
      mimeType: string;
      expiryDate?: string;
    }) => {
      return apiRequest('POST', '/api/user/documents', data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user', variables.userId, 'documents'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ documentId, userId }: { documentId: string; userId: string }) => {
      return apiRequest('DELETE', `/api/user/documents/${documentId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user', variables.userId, 'documents'] });
    },
  });
}

export function getDocumentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'drivers_license': "Driver's License",
    'insurance_card': 'Insurance Card',
    'proof_of_identity': 'Proof of Identity',
  };
  return labels[type] || type;
}

export function getStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case 'approved':
      return { bg: '#dcfce7', text: '#16a34a' };
    case 'rejected':
      return { bg: '#fee2e2', text: '#dc2626' };
    default:
      return { bg: '#fef3c7', text: '#d97706' };
  }
}
