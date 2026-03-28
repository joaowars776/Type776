import { UserProfile, INITIAL_PROFILE } from '../types';

const STORAGE_KEY = 'typing776_profile_v1';

export const saveProfile = (profile: UserProfile) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile", e);
  }
};

export const loadProfile = (): UserProfile => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        // Merge with initial profile to ensure new fields are present (schema migration)
        return { 
          ...INITIAL_PROFILE, 
          ...parsed, 
          settings: { ...INITIAL_PROFILE.settings, ...parsed.settings },
          stats: { ...INITIAL_PROFILE.stats, ...parsed.stats }
        };
      } catch (parseError) {
        console.error("Failed to parse profile data", parseError);
        return INITIAL_PROFILE;
      }
    }
  } catch (e) {
    console.error("Failed to load profile from storage", e);
  }
  return INITIAL_PROFILE;
};

export const resetProfile = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};

export const exportData = (profile: UserProfile) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `typing776_data_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const importData = (file: File): Promise<UserProfile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.username && json.stats) {
            resolve(json);
        } else {
            reject(new Error("Invalid format"));
        }
      } catch (e) {
        reject(e);
      }
    };
    reader.readAsText(file);
  });
};