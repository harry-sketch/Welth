import { create } from "zustand";

interface IUser {
  currency: string;
  setCurrency: (val: string) => void;

  needsOnBoarding: boolean | null;
  setNeedsOnBoarding: (val: boolean) => void;
}

export const userStore = create<IUser>((set) => ({
  currency: "INR",
  needsOnBoarding: null,

  setCurrency: (val: string) => set({ currency: val }),
  setNeedsOnBoarding: (val: boolean) => set({ needsOnBoarding: val }),
}));
