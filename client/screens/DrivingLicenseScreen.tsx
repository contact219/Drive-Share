import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, Alert, Pressable, Platform, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useUserDocuments, useUploadDocument, useDeleteDocument, getDocumentTypeLabel, getStatusColor } from "@/hooks/useDocuments";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

type DocumentType = 'drivers_license' | 'insurance_card';

export default function DrivingLicenseScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('drivers_license');

  const { data: documents, isLoading, refetch } = useUserDocuments(user?.id || null);
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();

  const licenseDoc = documents?.find(d => d.documentType === 'drivers_license');
  const insuranceDoc = documents?.find(d => d.documentType === 'insurance_card');

  const handlePickImage = useCallback(async (docType: DocumentType) => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Supported', 'Document upload is available in the Expo Go app on your mobile device.');
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload documents.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (!asset.base64) {
        Alert.alert('Error', 'Could not process image. Please try again.');
        return;
      }

      setIsUploading(true);
      try {
        const mimeType = asset.mimeType || 'image/jpeg';
        const documentData = `data:${mimeType};base64,${asset.base64}`;
        const fileName = asset.fileName || `${docType}_${Date.now()}.jpg`;

        await uploadDocument.mutateAsync({
          userId: user!.id,
          documentType: docType,
          documentData,
          fileName,
          mimeType,
        });

        Alert.alert('Success', `Your ${getDocumentTypeLabel(docType)} has been submitted for verification.`);
        refetch();
      } catch (error: any) {
        Alert.alert('Upload Failed', error.message || 'Could not upload document. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  }, [user, uploadDocument, refetch]);

  const handleTakePhoto = useCallback(async (docType: DocumentType) => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Supported', 'Camera is available in the Expo Go app on your mobile device.');
      return;
    }

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow camera access to take photos of your documents.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (!asset.base64) {
        Alert.alert('Error', 'Could not process image. Please try again.');
        return;
      }

      setIsUploading(true);
      try {
        const mimeType = asset.mimeType || 'image/jpeg';
        const documentData = `data:${mimeType};base64,${asset.base64}`;
        const fileName = `${docType}_${Date.now()}.jpg`;

        await uploadDocument.mutateAsync({
          userId: user!.id,
          documentType: docType,
          documentData,
          fileName,
          mimeType,
        });

        Alert.alert('Success', `Your ${getDocumentTypeLabel(docType)} has been submitted for verification.`);
        refetch();
      } catch (error: any) {
        Alert.alert('Upload Failed', error.message || 'Could not upload document. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  }, [user, uploadDocument, refetch]);

  const handleUpload = useCallback((docType: DocumentType) => {
    setSelectedDocType(docType);
    Alert.alert(
      `Upload ${getDocumentTypeLabel(docType)}`,
      'Choose how to upload your document:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => handleTakePhoto(docType) },
        { text: 'Choose from Library', onPress: () => handlePickImage(docType) },
      ]
    );
  }, [handlePickImage, handleTakePhoto]);

  const handleRemoveDocument = useCallback((docId: string, docType: string) => {
    Alert.alert(
      'Remove Document',
      `Are you sure you want to remove your ${getDocumentTypeLabel(docType)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument.mutateAsync({ documentId: docId, userId: user!.id });
              refetch();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Could not remove document.');
            }
          },
        },
      ]
    );
  }, [deleteDocument, user, refetch]);

  const renderDocumentCard = (doc: typeof licenseDoc, docType: DocumentType, title: string) => {
    if (!doc) {
      return (
        <View style={[styles.documentCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.documentHeader}>
            <Feather name="file-text" size={24} color={theme.textSecondary} />
            <ThemedText type="h4" style={styles.documentTitle}>{title}</ThemedText>
          </View>
          <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
            Not uploaded yet
          </ThemedText>
          <Button onPress={() => handleUpload(docType)} disabled={isUploading}>
            {isUploading ? 'Uploading...' : `Upload ${title}`}
          </Button>
        </View>
      );
    }

    const statusColors = getStatusColor(doc.verificationStatus);

    return (
      <View style={[styles.documentCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.documentHeader}>
          <Feather name="file-text" size={24} color={Colors.light.primary} />
          <ThemedText type="h4" style={styles.documentTitle}>{title}</ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <ThemedText type="small" style={{ color: statusColors.text, textTransform: 'capitalize' }}>
              {doc.verificationStatus}
            </ThemedText>
          </View>
        </View>

        {doc.documentData ? (
          <Image
            source={{ uri: doc.documentData }}
            style={styles.documentPreview}
            contentFit="cover"
          />
        ) : null}

        <View style={styles.documentInfo}>
          <View style={styles.infoRow}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Submitted</ThemedText>
            <ThemedText type="body">{new Date(doc.submittedAt).toLocaleDateString()}</ThemedText>
          </View>
          {doc.reviewNotes ? (
            <View style={styles.infoRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Review Notes</ThemedText>
              <ThemedText type="body">{doc.reviewNotes}</ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.documentActions}>
          <Button 
            onPress={() => handleUpload(docType)} 
            style={styles.actionButton}
            disabled={isUploading}
          >
            Re-upload
          </Button>
          <Pressable 
            onPress={() => handleRemoveDocument(doc.id, doc.documentType)}
            style={[styles.removeBtn, { borderColor: Colors.light.error }]}
          >
            <ThemedText type="body" style={{ color: Colors.light.error }}>Remove</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h3">My Documents</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.infoBox, { backgroundColor: Colors.light.primary + "15" }]}>
          <Feather name="info" size={20} color={Colors.light.primary} />
          <View style={styles.infoContent}>
            <ThemedText type="h4">Document Verification</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>
              Upload your driver's license and insurance card. Our team will verify them within 24 hours.
            </ThemedText>
          </View>
        </View>

        {renderDocumentCard(licenseDoc, 'drivers_license', "Driver's License")}
        {renderDocumentCard(insuranceDoc, 'insurance_card', "Insurance Card")}

        <ThemedText type="h4" style={styles.sectionTitle}>Requirements</ThemedText>

        <View style={[styles.requirementItem, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="check-circle" size={20} color={Colors.light.success} />
          <ThemedText type="body" style={styles.requirementText}>
            Valid government-issued driver's license
          </ThemedText>
        </View>
        <View style={[styles.requirementItem, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="check-circle" size={20} color={Colors.light.success} />
          <ThemedText type="body" style={styles.requirementText}>
            Current auto insurance card
          </ThemedText>
        </View>
        <View style={[styles.requirementItem, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="check-circle" size={20} color={Colors.light.success} />
          <ThemedText type="body" style={styles.requirementText}>
            Documents must not be expired
          </ThemedText>
        </View>
        <View style={[styles.requirementItem, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="check-circle" size={20} color={Colors.light.success} />
          <ThemedText type="body" style={styles.requirementText}>
            Clear, readable photos
          </ThemedText>
        </View>
      </ScrollView>

      {isUploading ? (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <ThemedText type="body" style={{ color: '#fff', marginTop: Spacing.md }}>
            Uploading document...
          </ThemedText>
        </View>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  placeholder: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  infoBox: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  infoContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  documentCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  documentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  documentTitle: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  documentPreview: {
    width: '100%',
    height: 150,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  documentInfo: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  infoRow: {
    gap: 2,
  },
  documentActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  removeBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  requirementText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
