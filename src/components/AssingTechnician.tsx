import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Select, SelectItem, Subtitle } from '@tremor/react';
import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import * as yup from 'yup';
import { prisma } from '@/lib/primsa';
import { toast } from 'react-toastify';
import { API } from '@/lib/API';

interface Inputs {
	technician_id: string;
}

const Schema = yup
	.object()
	.shape({
		technician_id: yup.string().required(),
	})
	.required();

export default function AssignTechnician({ user, faultData, setModal }: { user: any; faultData: any; setModal: any }) {
	const { data, error, isLoading } = useSWR<any>(user && { url: `/api/get-technicians?id=${user?.sub}` });

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<Inputs>({
		resolver: yupResolver(Schema),
	});

	const onSubmit = async (formData: Inputs) => {
		// find fault by id and add technician-id to it
		try {
			// technician_id, fault_id, reporter_id;
			const res: any = await API({
				url: '/api/assign-task',
				data: { technician_id: formData.technician_id, fault_id: faultData.id, reporter_id: faultData.reporter_id },
				method: 'POST',
			});

			await API({
				url: '/api/send-confirmation',
				method: 'POST',
				data: { first_name: res.user.full_name, to: res.user.email, fault_id: faultData.id },
			});

			setModal({ open: false, type: '' });
			toast.success('Fault assigned successfully', {
				position: toast.POSITION.TOP_RIGHT,
			});
		} catch (error) {
			setModal({ open: false, type: '' });
			toast.error('Something went wrong, please try again', {
				position: toast.POSITION.TOP_RIGHT,
			});
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Modal.Body>
				<Subtitle>Assign Fault #{faultData.id}</Subtitle>
				<br />
				<select {...register('technician_id')} className="w-full border border-gray-600 p-2 rounded-md">
					<option value="">Select a technician</option>
					{data &&
						data.technicians.map((tech: any, index: any) => {
							return (
								<option value={tech.id} key={index}>
									{tech.admin_name}
								</option>
							);
						})}
				</select>
			</Modal.Body>
			<Modal.Footer>
				<Button size="sm" type="submit" className="border-0" loading={isSubmitting}>
					Assign fault
				</Button>
			</Modal.Footer>
		</form>
	);
}
