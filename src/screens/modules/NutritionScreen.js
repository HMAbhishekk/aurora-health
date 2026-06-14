import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHealth } from '../../context/HealthContext';
import { colors } from '../../constants/colors';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function NutritionScreen() {
  const { todayData, logMeal } = useHealth();
  const [showModal, setShowModal] = useState(false);
  const [mealType, setMealType] = useState('Breakfast');
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');

  const handleLog = async () => {
    if (!mealName.trim()) return;
    await logMeal({ type: mealType, name: mealName, calories: parseInt(calories) || 0 });
    setMealName(''); setCalories(''); setShowModal(false);
  };

  const { totals, meals } = todayData.nutrition;

  return (
    <LinearGradient colors={['#0A0A1A', '#0d1f3c']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Nutrition</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
            <Text style={styles.addBtnText}>+ Log Meal</Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.caloriesValue}>{totals.calories}</Text>
          <Text style={styles.caloriesLabel}>calories today</Text>
          <View style={styles.macrosRow}>
            {[{ label: 'Protein', val: totals.protein, color: colors.hydration }, { label: 'Carbs', val: totals.carbs, color: colors.habits }, { label: 'Fat', val: totals.fat, color: colors.nutrition }].map(m => (
              <View key={m.label} style={styles.macroItem}>
                <Text style={[styles.macroVal, { color: m.color }]}>{m.val}g</Text>
                <Text style={styles.macroLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Meals by type */}
        {MEAL_TYPES.map(type => {
          const typeMeals = meals.filter(m => m.type === type);
          return (
            <View key={type} style={styles.mealSection}>
              <Text style={styles.mealType}>{type}</Text>
              {typeMeals.length === 0
                ? <Text style={styles.noMeal}>Nothing logged yet</Text>
                : typeMeals.map(meal => (
                  <View key={meal.id} style={styles.mealRow}>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    <Text style={styles.mealCal}>{meal.calories} kcal</Text>
                  </View>
                ))}
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log a Meal</Text>
            <View style={styles.typeRow}>
              {MEAL_TYPES.map(t => (
                <TouchableOpacity key={t} style={[styles.typeChip, mealType === t && styles.typeChipActive]} onPress={() => setMealType(t)}>
                  <Text style={[styles.typeText, mealType === t && styles.typeTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.modalInput} placeholder="Meal name" placeholderTextColor={colors.textMuted} value={mealName} onChangeText={setMealName} />
            <TextInput style={styles.modalInput} placeholder="Calories (optional)" placeholderTextColor={colors.textMuted} value={calories} onChangeText={setCalories} keyboardType="numeric" />
            <TouchableOpacity style={styles.modalBtn} onPress={handleLog}>
              <Text style={styles.modalBtnText}>Log Meal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
  addBtn: { backgroundColor: colors.nutrition, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  summaryCard: { backgroundColor: colors.backgroundCard, borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: colors.nutrition + '40' },
  caloriesValue: { fontSize: 48, fontWeight: '800', color: colors.nutrition },
  caloriesLabel: { color: colors.textSecondary, fontSize: 14, marginBottom: 16 },
  macrosRow: { flexDirection: 'row', gap: 32 },
  macroItem: { alignItems: 'center' },
  macroVal: { fontSize: 18, fontWeight: '700' },
  macroLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  mealSection: { marginBottom: 20 },
  mealType: { fontSize: 15, fontWeight: '600', color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1, fontSize: 12 },
  noMeal: { color: colors.textMuted, fontSize: 14, paddingLeft: 8 },
  mealRow: { backgroundColor: colors.backgroundCard, borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.border },
  mealName: { color: colors.textPrimary, fontSize: 14 },
  mealCal: { color: colors.nutrition, fontSize: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.backgroundElevated, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 32 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 20 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  typeChipActive: { backgroundColor: colors.nutrition, borderColor: colors.nutrition },
  typeText: { color: colors.textSecondary, fontSize: 13 },
  typeTextActive: { color: colors.white, fontWeight: '600' },
  modalInput: { backgroundColor: colors.surface, color: colors.textPrimary, borderRadius: 12, padding: 16, fontSize: 15, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  modalBtn: { backgroundColor: colors.nutrition, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  modalBtnText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  cancelText: { color: colors.textSecondary, textAlign: 'center', fontSize: 15 },
});