import { TextInput, Card, Select, SelectItem, Button } from '@tremor/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState } from 'react';
import { API } from '@/lib/API';
import { toast } from 'react-toastify';
import { Auth } from 'aws-amplify';
import { useAccount } from '@/store/useAccount';
import { useRouter } from 'next/router';

interface SignupInputs {
	first_name: string;
	last_name: string;
	email: string;
	designation?: string;
}

const SignupSchema = yup
	.object()
	.shape({
		first_name: yup.string().required(),
		last_name: yup.string().required(),
		email: yup.string().email().required(),
		designation: yup.string(),
	})
	.required();

export default function SuperUserForm() {
	const [role, setRole] = useState('');
	const updateUser = useAccount((state) => state.updateAttributes);
	const updateToken = useAccount((state) => state.updateAccessToken);
	const router = useRouter();
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<SignupInputs>({
		resolver: yupResolver(SignupSchema),
	});

	const onSubmit = async (data: SignupInputs) => {
		try {
			await API({
				url: '/api/hello',
				method: 'POST',
				data: { first_name: data.first_name, last_name: data.last_name, email: data.email, designation: data.designation, role },
			});
			toast.success('Account created successfully, ask the user to check for login details in the email', {
				position: toast.POSITION.TOP_RIGHT,
			});
		} catch (error: any) {
			toast.error((error && error.message) || 'Something went wrong, please try again', {
				position: toast.POSITION.TOP_RIGHT,
			});
		}
	};

	const handleLogout = async () => {
		try {
			await Auth.signOut();
			router.push('/login');
			updateUser(null);
			updateToken('');
		} catch (error: any) {
			toast.error((error && error.message) || 'Something went wrong, please try again', {
				position: toast.POSITION.TOP_RIGHT,
			});
		}
	};

	const roleCheck = (role === 'admin' || role === 'technician') && !watch('designation');

	return (
		<>
			<h5 className="text-center mb-4 mt-12">Create a super user, admin or technician</h5>
			<Card className="w-[450px] mx-auto max-w-[90%]">
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="mb-3">
						<label className="font-bold mb-1">First name</label>
						<TextInput
							placeholder="First name"
							type="text"
							{...register('first_name')}
							error={errors && !!errors.first_name?.message}
							errorMessage={errors && errors.first_name?.message}
						/>
					</div>
					<div className="mb-3">
						<label className="font-bold mb-1">Last name</label>
						<TextInput
							placeholder="Last name"
							type="text"
							{...register('last_name')}
							error={errors && !!errors.last_name?.message}
							errorMessage={errors && errors.last_name?.message}
						/>
					</div>
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
					{(role === 'admin' || role === 'technician') && (
						<div className="mb-4">
							<label className="font-bold mb-1">Exchange name</label>
							<TextInput
								placeholder="Exchange name"
								type="text"
								{...register('designation')}
								error={errors && !!errors.designation?.message}
								errorMessage={errors && errors.designation?.message}
							/>
						</div>
					)}
					<div className="mb-4">
						<Select placeholder="Select role" onValueChange={setRole}>
							<SelectItem value="super_user">Super user</SelectItem>
							<SelectItem value="admin">Exchange admin</SelectItem>
						</Select>
					</div>
					<Button type="submit" className="border-0 w-full" disabled={roleCheck || !role} loading={isSubmitting}>
						Create account
					</Button>
				</form>
			</Card>
			<div className="w-full flex justify-center mt-8">
				<Button className="border-0 w-20 text-center" onClick={() => handleLogout()}>
					Logout
				</Button>
			</div>
		</>
	);
}
