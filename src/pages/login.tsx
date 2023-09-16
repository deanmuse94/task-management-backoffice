import { Auth } from 'aws-amplify';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
// import { useAccount } from '@/store/useAccount';
import Modal from 'react-bootstrap/Modal';
import { Button, TextInput } from '@tremor/react';
import { Card, Metric, Text } from '@tremor/react';
import { Container } from 'react-bootstrap';
import { useAccount } from '@/store/useAccount';
import { toast } from 'react-toastify';
import Link from 'next/link';

interface LoginInputs {
	email: string;
	password: string;
}

interface NewPasswordInputs {
	new_password: string;
	confirm_new_password: string;
}

const SignInSchema = yup
	.object()
	.shape({
		email: yup.string().email().required(),
		password: yup.string().required(),
	})
	.required();

const NewPasswordSchema = yup
	.object()
	.shape({
		new_password: yup
			.string()
			.matches(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*[\]{}()?"\\,><':;|_~`=+-])[a-zA-Z\d!@#$%^&*[\]{}()?"\\,><':;|_~`=+-]{8,99}$/,
				'Must contain at least 8 Characters, 1 Uppercase, 1 Lowercase, 1 Special Character, and 1 Number',
			)
			.required('Password is required'),
		confirm_new_password: yup
			.string()
			.oneOf([yup.ref('new_password')], 'Passwords must match')
			.required('Confirm Password is required'),
	})
	.required();

export default function Login() {
	const router = useRouter();
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [user, setUser] = useState();
	const updateUserAttributes = useAccount((state) => state.updateAttributes);
	const updateAccessToken = useAccount((state) => state.updateAccessToken);
	const updateIsLoggedIn = useAccount((state) => state.updateIsLoggedIn);

	useEffect(() => {
		const session = async () => {
			const current_session = await Auth.currentSession();

			if (current_session) {
				router.push('/');
			} else return;
		};

		session();
	}, []);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginInputs>({
		resolver: yupResolver(SignInSchema),
		defaultValues: { email: router && router.query.email ? (router.query.email as string) : '' },
	});

	const {
		register: registerTwo,
		handleSubmit: handleSubmitTwo,
		formState: { errors: errorsTwo, isSubmitting: isSubmittingTwo },
	} = useForm({
		resolver: yupResolver(NewPasswordSchema),
	});

	const onSubmit = async (data: LoginInputs) => {
		try {
			const user = await Auth.signIn(data.email, data.password);

			if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
				setUser(user);
				setShowNewPassword(true);
			} else {
				updateUserAttributes({
					email: user.attributes.email,
					firstName: user.attributes.given_name,
					lastName: user.attributes.family_name,
					sub: user.attributes.sub,
					isAdmin: Boolean(Number(user.attributes['custom:is_admin'])),
					isSuperUser: Boolean(Number(user.attributes['custom:is_superuser'])),
					isTechnician: Boolean(Number(user.attributes['custom:is_technician'])),
					designation: user.attributes['custom:designation'],
				});

				const session = await Auth.currentSession();
				const access_token = session.getAccessToken().getJwtToken();
				updateAccessToken(access_token);
				updateIsLoggedIn(true);
				router.push('/');
			}
		} catch (error: any) {
			toast.error((error && error.message) || 'Something went wrong, please try again', {
				position: toast.POSITION.TOP_RIGHT,
			});
		}
	};

	return (
		<Container className="py-10">
			<h4 className="text-center mb-4">Fault Tracker Admin Login</h4>
			<Card className="w-[540px] max-w-[90%] mx-auto">
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="mb-3">
						<label className="font-bold mb-1">Email</label>
						<TextInput
							placeholder="Email"
							type="email"
							{...register('email')}
							error={errors && !!errors.email?.message}
							errorMessage={errors && errors.email?.message}
						/>
					</div>

					<div className="mb-4">
						<label className="font-bold mb-1">Password</label>
						<TextInput
							placeholder="Password"
							type="password"
							{...register('password')}
							error={errors && !!errors.password?.message}
							errorMessage={errors && errors.password?.message}
						/>
					</div>
					<Button size="sm" type="submit" className="border-0 w-full mb-4" loading={isSubmitting}>
						Login
					</Button>
					<Link href="/reset-password">Forgot password?</Link>
				</form>
			</Card>
			<Modal show={showNewPassword}>
				<Modal.Header>
					<Modal.Title>Create new password</Modal.Title>
				</Modal.Header>
				<form
					onSubmit={handleSubmitTwo(async (data: NewPasswordInputs) => {
						const newPassword = data.new_password;
						const loggedInUser = await Auth.completeNewPassword(user, newPassword);

						console.log(loggedInUser);

						const userAttributes = loggedInUser.challengeParam.userAttributes;

						updateUserAttributes({
							email: userAttributes.email,
							firstName: userAttributes.given_name,
							lastName: userAttributes.family_name,
							sub: loggedInUser.username,
							isAdmin: Boolean(Number(userAttributes['custom:is_admin'])),
							isSuperUser: Boolean(Number(userAttributes['custom:is_superuser'])),
							isTechnician: Boolean(Number(userAttributes['custom:is_technician'])),
							designation: userAttributes['custom:designation'],
						});

						const session = await Auth.currentSession();
						const access_token = session.getAccessToken().getJwtToken();
						updateAccessToken(access_token);
						updateIsLoggedIn(true);
						router.push('/');
					})}
				>
					<Modal.Body>
						You are required to set up a new password for future logins
						<br />
						<br />
						<TextInput
							placeholder="New password"
							type="password"
							{...registerTwo('new_password')}
							error={errorsTwo && !!errorsTwo.new_password?.message}
							errorMessage={errorsTwo && errorsTwo.new_password?.message}
						/>
						<br />
						<TextInput
							placeholder="Re-enter password"
							type="password"
							{...registerTwo('confirm_new_password')}
							error={errorsTwo && !!errorsTwo.confirm_new_password?.message}
							errorMessage={errorsTwo && errorsTwo.confirm_new_password?.message}
						/>
					</Modal.Body>
					<Modal.Footer>
						<Button size="sm" type="submit" className="border-0" loading={isSubmittingTwo}>
							Update Password
						</Button>
					</Modal.Footer>
				</form>
			</Modal>
		</Container>
	);
}
