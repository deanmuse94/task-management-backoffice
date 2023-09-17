import { API } from '@/lib/API';
import { useUser } from '@/hooks/useUser';
import { Auth } from 'aws-amplify';
import { useRouter } from 'next/router';
import { useAccount } from '@/store/useAccount';
import {
	Button,
	Card,
	Grid,
	Title,
	Text,
	Tab,
	TabList,
	TabGroup,
	TabPanel,
	TabPanels,
	Flex,
	BarList,
	Bold,
	Table,
	TableRow,
	TableCell,
	TableHead,
	TableHeaderCell,
	TableBody,
	Badge,
	Color,
	DatePicker,
	Select,
	SelectItem,
	List,
	ListItem,
	Subtitle,
	TextInput,
} from '@tremor/react';
import { Container, Modal } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import SuperUserForm from '@/components/SuperUserForm';
import NotFound from '@/components/NotFound';
import useSWR from 'swr';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import TechnicianList from '@/components/TechnicianList';
import dateFormat from 'dateformat';
import AssignTechnician from '@/components/AssingTechnician';

export interface IFaults {
	faults: {
		id: number;
		description: string;
		status: 'created' | 'technician_dispatched' | 'resolved' | 'shelved' | 'canceled';
		reported_at: string;
		resoloved_at: string;
		reporter_id: string;
		reporter_name: string;
		reporter_account_nuber: string;
		service_type: 'fibre' | 'ADSL';
	}[];
}

export interface FaultInputs {
	first_name: string;
	last_name: string;
	email: string;
}

const UpdateFaultSchema = yup
	.object()
	.shape({
		first_name: yup.string().required(),
		last_name: yup.string().required(),
		email: yup.string().email().required(),
	})
	.required();

export default function Home() {
	const { isLoggedIn, user } = useUser();
	const updateUser = useAccount((state) => state.updateAttributes);
	const updateToken = useAccount((state) => state.updateAccessToken);
	const router = useRouter();
	const [modal, setModal] = useState<{ open: boolean; type: 'add-technician' | 'action-fault' | '' }>({ open: false, type: '' });
	const [faultData, setFaultData] = useState<any>();

	const { data, error, isLoading } = useSWR<IFaults>(user && { url: `/api/get-faults?id=${user?.sub}` });

	const handleLogout = async () => {
		await Auth.signOut();
		router.push('/login');
		updateUser(null);
		updateToken('');
	};

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FaultInputs>({
		resolver: yupResolver(UpdateFaultSchema),
	});

	const fibreReports = data && data?.faults.filter((report) => report.service_type === 'fibre').length;
	const adslReports = data && data?.faults.filter((report) => report.service_type === 'ADSL').length;

	const barListData: any = [
		{
			name: 'Fibre Optic',
			value: fibreReports || 0,
			color: 'emerald',
		},
		{
			name: 'Copper',
			value: adslReports || 0,
			color: 'blue',
		},
	];

	if (user && user?.isSuperUser)
		return (
			<Container>
				<SuperUserForm />
			</Container>
		);
	else if (user && user?.isAdmin)
		return (
			<Container className="pt-10">
				<Flex justifyContent="between">
					<Title>{user?.designation} Admin dashboard</Title>
					<Button className="border-0" onClick={() => handleLogout()}>
						Logout
					</Button>
				</Flex>
				<Text>
					Exchange admin: <strong>{user?.firstName + ' ' + user?.lastName}</strong>
				</Text>
				<TabGroup className="mt-6">
					<TabList>
						<Tab>Page 1</Tab>
					</TabList>
					<TabPanels>
						<TabPanel>
							<Grid numItemsMd={2} numItemsLg={2} className="gap-6 mt-6">
								<Card className="max-h-[250px] overflow-auto">
									<Flex justifyContent="between" className="mb-3">
										<Title>Technician tasks</Title>
										<Button size="xs" color="green" className="border-0" onClick={() => setModal({ open: true, type: 'add-technician' })}>
											Add technician
										</Button>
									</Flex>
									<TechnicianList user={user} faults={data && data?.faults} />
								</Card>
								<Card className="h-20px">
									<Title>Fault Statistics</Title>
									<Flex className="mt-4">
										<Text>
											<Bold>Internet Service</Bold>
										</Text>
										<Text>
											<Bold>Faults</Bold>
										</Text>
									</Flex>
									<BarList data={barListData} className="mt-2" />
								</Card>
							</Grid>
							<div className="mt-6">
								<Card className="overflow-auto">
									<Flex justifyContent="between" className="space-x-2">
										<Flex justifyContent="start">
											<Title className="mr-2">Faults in {user?.designation}</Title>
											<Badge color="red">{data && data?.faults.length}</Badge>
										</Flex>
										{/* <DatePicker className="max-w-sm" defaultValue={new Date()} /> */}
									</Flex>
									{data && data?.faults.length > 0 ? (
										<Table className="mt-6">
											<TableHead>
												<TableRow>
													<TableHeaderCell>Fault Ref</TableHeaderCell>
													<TableHeaderCell>Reporter Name</TableHeaderCell>
													<TableHeaderCell>Date Reported</TableHeaderCell>
													<TableHeaderCell>Status</TableHeaderCell>
													<TableHeaderCell>Action fault</TableHeaderCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{data?.faults.map((fault) => (
													<TableRow key={fault?.id}>
														<TableCell>#{fault?.id}</TableCell>
														<TableCell>{fault?.reporter_name}</TableCell>
														<TableCell>{dateFormat(fault?.reported_at)}</TableCell>
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
																	disabled={fault?.status !== 'created'}
																	size="sm"
																	className="border-0"
																	onClick={() => {
																		setModal({ open: true, type: 'action-fault' });
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
										<div className="w-full h-full flex flex-col items-center justify-center mt-16 mb-6">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												strokeWidth={1.5}
												stroke="currentColor"
												className="w-24 h-24 mb-4"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6 3.75l3 3m0 0l3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75"
												/>
											</svg>
											<Title>No data found</Title>
										</div>
									)}
								</Card>
							</div>
						</TabPanel>
					</TabPanels>
				</TabGroup>
				<Modal show={modal.open} onHide={() => setModal({ open: false, type: '' })}>
					{modal.type === 'add-technician' ? (
						<form
							onSubmit={handleSubmit(async (data: FaultInputs) => {
								try {
									API({
										url: '/api/add-technician',
										method: 'POST',
										data: {
											first_name: data.first_name,
											last_name: data.last_name,
											email: data.email,
											designation: user?.sub,
										},
									});
									setModal({ open: false, type: '' });
									toast.success('Successfully added technician', {
										position: toast.POSITION.TOP_RIGHT,
									});
								} catch (error: any) {
									setModal({ open: false, type: '' });
									toast.error((error && error.message) || 'Something went wrong, please try again', {
										position: toast.POSITION.TOP_RIGHT,
									});
								}
							})}
						>
							<Modal.Body>
								<Subtitle>Add new technician account</Subtitle>
								<br />
								<TextInput
									placeholder="First name"
									type="text"
									{...register('first_name')}
									error={errors && !!errors.first_name?.message}
									errorMessage={errors && errors.first_name?.message}
								/>
								<br />
								<TextInput
									placeholder="Last name"
									type="text"
									{...register('last_name')}
									error={errors && !!errors.last_name?.message}
									errorMessage={errors && errors.last_name?.message}
								/>
								<br />
								<TextInput
									placeholder="Email"
									type="email"
									{...register('email')}
									error={errors && !!errors.email?.message}
									errorMessage={errors && errors.email?.message}
								/>
							</Modal.Body>
							<Modal.Footer>
								<Button size="sm" type="submit" className="border-0" loading={isSubmitting}>
									Add technician
								</Button>
							</Modal.Footer>
						</form>
					) : modal.type === 'action-fault' ? (
						<AssignTechnician user={user} faultData={faultData} setModal={setModal} />
					) : null}
				</Modal>
			</Container>
		);
	else if (user && user?.isTechnician) return 'technician view';
	else return <NotFound />;
}
