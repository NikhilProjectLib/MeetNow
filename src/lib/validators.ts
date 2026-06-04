import { CreateActivityForm } from "@/types";

export function validateCreateForm(
  form: CreateActivityForm
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Name validation
  if (!form.name || form.name.trim().length === 0) {
    errors.name = "Activity name is required";
  } else if (form.name.length > 100) {
    errors.name = "Activity name must be 100 characters or less";
  }

  // Location validation
  if (!form.location || form.location.trim().length === 0) {
    errors.location = "Location is required";
  } else if (form.location.length > 200) {
    errors.location = "Location must be 200 characters or less";
  }

  // Date validation
  if (!form.date) {
    errors.date = "Date is required";
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(form.date);
    if (selectedDate < today) {
      errors.date = "Date must be today or in the future";
    }
  }

  // Time validation
  if (!form.time) {
    errors.time = "Time is required";
  }

  // Players needed validation
  if (form.playersNeeded < 2) {
    errors.playersNeeded = "At least 2 players are needed";
  } else if (form.playersNeeded > 500) {
    errors.playersNeeded = "Maximum 500 players allowed";
  }

  // Category validation - now accepts any non-empty string (dynamic categories)
  if (!form.category || form.category.trim().length === 0) {
    errors.category = "Please select or create a category";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
