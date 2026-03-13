import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Crypto from 'expo-crypto';
import { createCustomerSchema } from '@scanorder/shared';
import type { Customer } from '@scanorder/shared';
import { useAuth } from '@/store/auth';

interface NewCustomerFormProps {
  onSave: (customer: Customer) => void;
  onCancel: () => void;
}

/**
 * Form to create a new customer inline from the mobile app.
 *
 * Validates with the shared Zod schema. Saves to local DB (PowerSync)
 * and makes the customer immediately available for order assignment.
 */
export function NewCustomerForm({ onSave, onCancel }: NewCustomerFormProps) {
  const user = useAuth((s) => s.user);
  const tenantId = (user?.app_metadata?.tenant_id as string) ?? 'unknown';

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('NL');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    setErrors({});

    // Build address only if any address field is filled
    const hasAddress = street || city || postalCode;
    const address = hasAddress
      ? { street, city, postal_code: postalCode, country }
      : null;

    const input = {
      company_name: companyName.trim(),
      contact_name: contactName.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      vat_number: vatNumber.trim() || null,
      price_group: null,
      address,
      notes: notes.trim() || null,
    };

    // Validate with Zod
    const result = createCustomerSchema.safeParse(input);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const customer: Customer = {
        id: Crypto.randomUUID(),
        tenant_id: tenantId ?? 'unknown',
        company_name: result.data.company_name,
        contact_name: result.data.contact_name,
        email: result.data.email,
        phone: result.data.phone,
        vat_number: result.data.vat_number,
        price_group: result.data.price_group,
        address: result.data.address
          ? {
              street: result.data.address.street,
              city: result.data.address.city,
              postal_code: result.data.address.postal_code,
              country: result.data.address.country,
              province: result.data.address.province,
            }
          : null,
        notes: result.data.notes,
        is_deleted: false,
        created_at: now,
        updated_at: now,
      };

      // TODO: Save to local SQLite via PowerSync
      // await db.insertInto('customers').values(customer).execute();

      onSave(customer);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save customer';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  }, [
    companyName, contactName, email, phone, vatNumber,
    street, city, postalCode, country, notes, tenantId, onSave, user,
  ]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Customer</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[styles.saveButton, saving && styles.saveButtonDisabled]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
        {/* Company Name (required) */}
        <Text style={styles.label}>Company Name *</Text>
        <TextInput
          value={companyName}
          onChangeText={setCompanyName}
          placeholder="e.g. Boekhandel De Vries"
          style={[styles.input, errors['company_name'] && styles.inputError]}
          placeholderTextColor="#9CA3AF"
          autoFocus
        />
        {errors['company_name'] && (
          <Text style={styles.errorText}>{errors['company_name']}</Text>
        )}

        {/* Contact Name */}
        <Text style={styles.label}>Contact Name</Text>
        <TextInput
          value={contactName}
          onChangeText={setContactName}
          placeholder="e.g. Jan de Vries"
          style={styles.input}
          placeholderTextColor="#9CA3AF"
        />

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="jan@boekhandel.nl"
          style={[styles.input, errors['email'] && styles.inputError]}
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {errors['email'] && (
          <Text style={styles.errorText}>{errors['email']}</Text>
        )}

        {/* Phone */}
        <Text style={styles.label}>Phone</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="+31 6 12345678"
          style={styles.input}
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
        />

        {/* VAT Number */}
        <Text style={styles.label}>VAT Number (BTW)</Text>
        <TextInput
          value={vatNumber}
          onChangeText={setVatNumber}
          placeholder="NL123456789B01"
          style={styles.input}
          placeholderTextColor="#9CA3AF"
          autoCapitalize="characters"
          autoCorrect={false}
        />

        {/* Address Section */}
        <Text style={styles.sectionTitle}>Address</Text>

        <Text style={styles.label}>Street</Text>
        <TextInput
          value={street}
          onChangeText={setStreet}
          placeholder="Keizersgracht 100"
          style={styles.input}
          placeholderTextColor="#9CA3AF"
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Postal Code</Text>
            <TextInput
              value={postalCode}
              onChangeText={setPostalCode}
              placeholder="1015 AA"
              style={styles.input}
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>City</Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="Amsterdam"
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <Text style={styles.label}>Country</Text>
        <TextInput
          value={country}
          onChangeText={setCountry}
          placeholder="NL"
          style={styles.input}
          placeholderTextColor="#9CA3AF"
          maxLength={2}
          autoCapitalize="characters"
        />

        {/* Notes */}
        <Text style={styles.label}>Notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Internal notes about this customer..."
          style={[styles.input, styles.textArea]}
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Bottom spacing for keyboard */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  cancelButton: { fontSize: 16, color: '#6B7280', fontWeight: '500' },
  saveButton: { fontSize: 16, color: '#2563EB', fontWeight: '600' },
  saveButtonDisabled: { opacity: 0.5 },
  form: { flex: 1, padding: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
  },
  inputError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  textArea: {
    minHeight: 80,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
});
