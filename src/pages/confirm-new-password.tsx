import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Card, TextInput } from '@tremor/react';
import { Auth } from 'aws-amplify';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import * as yup from 'yup';

interface Inputs {
	code: string;
	password: string;
	confirm_password: string;
}

const CodeSchema = yup
	.object()
	.shape({
		code: yup.string().required(),
		password: yup
			.string()
			.matches(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*[\]{}()?"\\,><':;|_~`=+-])[a-zA-Z\d!@#$%^&*[\]{}()?"\\,><':;|_~`=+-]{8,99}$/,
				'Must contain at least 8 Characters, 1 Uppercase, 1 Lowercase, 1 Special Character, and 1 Number',
			)
			.required('Password is required'),
		confirm_password: yup
			.string()
			.oneOf([yup.ref('password')], 'Passwords must match')
			.required('Confirm Password is required'),
	})
	.required();

export default function ConfirmPassword() {
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
		resolver: yupResolver(CodeSchema),
	});

	const onSubmit = async (data: Inputs) => {
		const email = router.query.email as string;

		try {
			await Auth.forgotPasswordSubmit(email, data.code, data.password);

			toast.success('Your password was reset successfully', {
				position: toast.POSITION.TOP_RIGHT,
			});

			router.push(`/login?email=${email}`);
		} catch (error: any) {
			toast.error((error && error.message) || 'Something went wrong, please try again', {
				position: toast.POSITION.TOP_RIGHT,
			});
		}
	};

	return (
		<Container className="py-10">
			<h4 className="text-center mb-4">Confirm password</h4>
			<Card className="w-[540px] max-w-[90%] mx-auto">
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="mb-3">
						<label className="font-bold mb-1">Code</label>
						<TextInput
							placeholder="Enter code"
							type="text"
							{...register('code')}
							error={errors && !!errors.code?.message}
							errorMessage={errors && errors.code?.message}
						/>
					</div>
					<div className="mb-3">
						<label className="font-bold mb-1">New password</label>
						<TextInput
							placeholder="New password"
							type="password"
							{...register('password')}
							error={errors && !!errors.password?.message}
							errorMessage={errors && errors.password?.message}
						/>
					</div>
					<div className="mb-4">
						<label className="font-bold mb-1">Re-enter password</label>
						<TextInput
							placeholder="Re-enter password"
							type="password"
							{...register('confirm_password')}
							error={errors && !!errors.confirm_password?.message}
							errorMessage={errors && errors.confirm_password?.message}
						/>
					</div>
					<Button size="sm" type="submit" className="border-0 w-full mb-4" loading={isSubmitting}>
						Reset password
					</Button>
				</form>
			</Card>
		</Container>
	);
}
