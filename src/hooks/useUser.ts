import { useAccount } from '@/store/useAccount';
import { Auth } from 'aws-amplify';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export function useUser() {
	const isLoggedIn = useAccount((state) => state.isLoggedIn);
	const updateIsLoggedIn = useAccount((state) => state.updateIsLoggedIn);
	const user = useAccount((state) => state.attributes);
	const updateUser = useAccount((state) => state.updateAttributes);
	const updateToken = useAccount((state) => state.updateAccessToken);
	const router = useRouter();

	useEffect(() => {
		const findUser = async () => {
			try {
				if (user) return;
				else {
					const data = await Auth.currentAuthenticatedUser();
					updateToken(data.signInUserSession.accessToken.jwtToken);
					updateUser({
						email: data.attributes.email,
						firstName: data.attributes.given_name,
						lastName: data.attributes.family_name,
						sub: data.attributes.sub,
						isAdmin: Boolean(Number(data.attributes['custom:is_admin'])),
						isSuperUser: Boolean(Number(data.attributes['custom:is_superuser'])),
						isTechnician: Boolean(Number(data.attributes['custom:is_technician'])),
						designation: data.attributes['custom:designation'],
					});
					updateIsLoggedIn(true);
				}
			} catch (err) {
				updateIsLoggedIn(true);
				router.push('/login');
			}
		};

		findUser();
	}, []);

	return { isLoggedIn, user };
}
