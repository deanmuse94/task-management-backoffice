import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Card, TextInput } from '@tremor/react';
import { Auth } from 'aws-amplify';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import * as yup from 'yup';

interface Inputs {
	email: string;
}

const ResetPasswordSchema = yup
	.object()
	.shape({
		email: yup.string().email().required(),
	})
	.required();

export default function ForgotPassword() {
	const router = useRouter();

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
	} = useForm<Inputs>({
		resolver: yupResolver(ResetPasswordSchema),
	});

	const onSubmit = async (data: Inputs) => {
		try {
			await Auth.forgotPassword(data.email);
			toast.success(`We have sent a code to ${data.email}`, {
				position: toast.POSITION.TOP_RIGHT,
			});
			router.push(`/confirm-new-password?email=${data.email}`);
		} catch (error: any) {
			toast.error((error && error.message) || 'Something went wrong, please try again', {
				position: toast.POSITION.TOP_RIGHT,
			});
		}
	};

	return (
		<Container className="py-10">
			<h4 className="text-center mb-4">Reset your password</h4>
			<Card className="w-[540px] max-w-[90%] mx-auto">
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="mb-4">
						<label className="font-bold mb-1">Email</label>
						<TextInput
							placeholder="Email"
							type="email"
							{...register('email')}
							error={errors && !!errors.email?.message}
							errorMessage={errors && errors.email?.message}
						/>
					</div>
					<Button size="sm" type="submit" className="border-0 w-full mb-4" loading={isSubmitting}>
						Reset password
					</Button>
					<Link href="/login">Login</Link>
				</form>
			</Card>
		</Container>
	);
}
