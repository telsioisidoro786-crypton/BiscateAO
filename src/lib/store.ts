import { create } from "zustand";
import { persist } from "zustand/middleware";

type ChatLine = { from: "me" | "pro"; text: string; at: string };

type State = {
  neighborhood: string;
  savedIds: string[];
  myJobIds: string[];
  accepted: Record<string, string>;
  chats: Record<string, ChatLine[]>;
  hydrated: boolean;
  setNeighborhood: (n: string) => void;
  toggleSaved: (id: string) => void;
  rememberJob: (id: string) => void;
  acceptProposal: (jobId: string, proposalId: string, greeting: string) => void;
  sendChat: (jobId: string, text: string) => void;
  markHydrated: () => void;
};

export const useBiscate = create<State>()(
  persist(
    (set, get) => ({
      neighborhood: "Viana",
      savedIds: [],
      myJobIds: [],
      accepted: {},
      chats: {},
      hydrated: false,
      markHydrated: () => set({ hydrated: true }),
      setNeighborhood: (neighborhood) => set({ neighborhood }),
      toggleSaved: (id) =>
        set({
          savedIds: get().savedIds.includes(id)
            ? get().savedIds.filter((x) => x !== id)
            : [...get().savedIds, id],
        }),
      rememberJob: (id) =>
        set({
          myJobIds: get().myJobIds.includes(id)
            ? get().myJobIds
            : [id, ...get().myJobIds],
        }),
      acceptProposal: (jobId, proposalId, greeting) =>
        set({
          accepted: { ...get().accepted, [jobId]: proposalId },
          chats: {
            ...get().chats,
            [jobId]: get().chats[jobId] ?? [
              { from: "pro", text: greeting, at: new Date().toISOString() },
            ],
          },
        }),
      sendChat: (jobId, text) => {
        const line: ChatLine = {
          from: "me",
          text,
          at: new Date().toISOString(),
        };
        set({
          chats: {
            ...get().chats,
            [jobId]: [...(get().chats[jobId] ?? []), line],
          },
        });
      },
    }),
    {
      name: "biscateao",
      skipHydration: true,
      partialize: (s) => ({
        neighborhood: s.neighborhood,
        savedIds: s.savedIds,
        myJobIds: s.myJobIds,
        accepted: s.accepted,
        chats: s.chats,
      }),
    },
  ),
);
