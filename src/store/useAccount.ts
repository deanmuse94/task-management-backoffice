import { create } from 'zustand';

export type UserAttributes = {
	email: string;
	firstName: string;
	lastName: string;
	sub: string;
	isAdmin: boolean;
	isSuperUser: boolean;
	isTechnician: boolean;
	designation: string;
} | null;

interface UserState {
	accessToken: string;
	attributes: UserAttributes | null;
	isLoggedIn: boolean;
	updateAccessToken: (val: string) => void;
	updateAttributes: (val: UserAttributes) => void;
	updateIsLoggedIn: (val: boolean) => void;
}

export const useAccount = create<UserState>()((set) => ({
	accessToken: '',
	attributes: null,
	isLoggedIn: false,
	updateAccessToken: (accessToken) => set(() => ({ accessToken })),
	updateAttributes: (attributes) => set(() => ({ attributes })),
	updateIsLoggedIn: (isLoggedIn) => set(() => ({ isLoggedIn })),
}));
