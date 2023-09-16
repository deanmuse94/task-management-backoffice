import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Ubuntu } from 'next/font/google';
import { Amplify } from 'aws-amplify';
import { ToastContainer } from 'react-toastify';
import { SWRConfig } from 'swr';
import { API } from '@/lib/API';
import 'bootstrap/dist/css/bootstrap.css';
import '@/styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';

const ubuntu = Ubuntu({ subsets: ['latin'], weight: ['400', '500', '700'] });

Amplify.configure({
	Auth: {
		region: process.env.NEXT_PUBLIC_AWS_REGION,
		userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
		userPoolWebClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
		mandatorySignIn: false,
		signUpVerificationMethod: 'code',
	},
});

export default function App({ Component, pageProps }: AppProps) {
	return (
		<SWRConfig
			value={{
				fetcher: API,
				revalidateOnFocus: false,
			}}
		>
			<div className={`${ubuntu.className}`}>
				<Component {...pageProps} />
				<ToastContainer />
			</div>
		</SWRConfig>
	);
}
