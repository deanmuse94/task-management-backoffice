import { IFaults } from '@/pages';
import { UserAttributes, useAccount } from '@/store/useAccount';
import {
	Badge,
	Button,
	Flex,
	Subtitle,
	Tab,
	TabGroup,
	TabList,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeaderCell,
	TableRow,
	Title,
} from '@tremor/react';
import dateFormat from 'dateformat';
import { useState } from 'react';
import { Container, Modal } from 'react-bootstrap';
import useSWR from 'swr';
import { prisma } from '@/lib/primsa';
import { API } from '@/lib/API';
import { toast } from 'react-toastify';
import { Auth } from 'aws-amplify';
import { useRouter } from 'next/router';

export default function TechnicianView({ user, data }: { user: UserAttributes; data: IFaults | undefined }) {
	const [modal, setModal] = useState<boolean>(false);
	const [loadingOne, setLoadingOne] = useState(false);
	const [loadingTwo, setLoadingTwo] = useState(false);
	const updateUser = useAccount((state) => state.updateAttributes);
	const updateToken = useAccount((state) => state.updateAccessToken);
	const router = useRouter();

	const [faultData, setFaultData] = useState<{
		id: number;
		description: string;
		status: 'created' | 'technician_dispatched' | 'resolved' | 'shelved' | 'canceled';
		reported_at: string;
		resoloved_at: string;
		reporter_id: string;
		reporter_name: string;
		reporter_account_nuber: string;
		service_type: 'fibre' | 'ADSL';
	}>();

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

	return (
		<Container className="pt-10">
			<TabGroup>
				<TabList>
					<Tab>Assigned faults</Tab>
				</TabList>
				<Flex className="mt-3">
					<Subtitle>{user && user?.firstName + ' ' + user?.lastName}'s Fault list</Subtitle>
					<Button onClick={() => handleLogout()} color="blue" size="xs" className="border-0">
						Logout
					</Button>
				</Flex>
				{data && data?.faults.length > 0 ? (
					<Table className="mt-6">
						<TableHead>
							<TableRow>
								<TableHeaderCell>Fault Ref</TableHeaderCell>
								<TableHeaderCell>Reporter Name</TableHeaderCell>
								<TableHeaderCell>Contact number</TableHeaderCell>
								<TableHeaderCell>Status</TableHeaderCell>
								<TableHeaderCell>Action fault</TableHeaderCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{data?.faults.map((fault) => (
								<TableRow key={fault?.id}>
									<TableCell>#{fault?.id}</TableCell>
									<TableCell>{fault?.reporter_name}</TableCell>
									<TableCell>{fault?.reporter_account_nuber}</TableCell>
									<TableCell>
										<Badge
											color={
												fault?.status === 'created'
													? 'amber'
													: fault?.status === 'technician_dispatched'
													? 'blue'
													: fault?.status === 'resolved'
													? 'emerald'
													: fault?.status === 'shelved'
													? 'red'
													: fault?.status === 'canceled'
													? 'amber'
													: 'blue'
											}
											size="xs"
										>
											{fault?.status}
										</Badge>
									</TableCell>
									<TableCell>
										<div className="flex">
											<Button
												disabled={fault?.status === 'resolved'}
												size="sm"
												className="border-0"
												onClick={() => {
													setModal(true);
													setFaultData(fault);
												}}
											>
												Action Fault
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				) : (
					<Title className="text-center mt-20">No data found</Title>
				)}
			</TabGroup>

			<Modal show={modal} onHide={() => setModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Update fault status</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Subtitle className="mb-3">Update fault #{faultData?.id}</Subtitle>
					<Button
						disabled={faultData?.status === 'resolved'}
						color="green"
						className="border-0 mr-2"
						loading={loadingOne}
						onClick={async () => {
							try {
								setLoadingOne(true);
								await API({ url: '/api/update-fault', method: 'POST', data: { fault_id: faultData?.id, action: 'resolved' } });
								setLoadingOne(false);
								setModal(false);
								toast.success('Fault updated successfully', {
									position: toast.POSITION.TOP_RIGHT,
								});
							} catch (err: any) {
								toast.error((err && err.message) || 'Failed to update fault', {
									position: toast.POSITION.TOP_RIGHT,
								});
							}
						}}
					>
						Set as resolved
					</Button>
					<Button
						disabled={faultData?.status === 'shelved'}
						color="amber"
						className="border-0"
						loading={loadingTwo}
						onClick={async () => {
							try {
								setLoadingTwo(true);
								await API({ url: '/api/update-fault', method: 'POST', data: { fault_id: faultData?.id, action: 'shelved' } });
								setLoadingTwo(false);
								setModal(false);
								toast.success('Fault updated successfully', {
									position: toast.POSITION.TOP_RIGHT,
								});
							} catch (err: any) {
								toast.error((err && err.message) || 'Failed to update fault', {
									position: toast.POSITION.TOP_RIGHT,
								});
							}
						}}
					>
						Shelf fault
					</Button>
				</Modal.Body>
			</Modal>
		</Container>
	);
}
