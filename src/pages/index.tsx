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
} from '@tremor/react';
import { Container } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import SuperUserForm from '@/components/SuperUserForm';
import NotFound from '@/components/NotFound';

export default function Home() {
	const { isLoggedIn, user } = useUser();
	const updateUser = useAccount((state) => state.updateAttributes);
	const updateToken = useAccount((state) => state.updateAccessToken);
	const router = useRouter();

	const handleAdd = () => {
		console.log('hello there');
		API({ url: '/api/hello' });
	};

	const handleLogout = async () => {
		await Auth.signOut();
		router.push('/login');
		updateUser(null);
		updateToken('');
	};

	const data: any = [
		{
			name: 'Fibre Optic',
			value: 456,
			color: 'emerald',
		},
		{
			name: 'Copper',
			value: 351,
			color: 'blue',
		},
	];

	const transactions = [
		{
			transactionID: '#123456',
			user: 'Lena Mayer',
			item: 'Under Armour Shorts',
			status: 'Ready for dispatch',
		},
		{
			transactionID: '#234567',
			user: 'Max Smith',
			item: 'Book - Wealth of Nations',
			status: 'Ready for dispatch',
		},
		{
			transactionID: '#345678',
			user: 'Anna Stone',
			item: 'Garmin Forerunner 945',
			status: 'Cancelled',
		},
	];

	const cities = [
		{
			city: 'Athens',
			rating: '2 open PR',
		},
		{
			city: 'Luzern',
			rating: '1 open PR',
		},
		{
			city: 'Zürich',
			rating: '0 open PR',
		},
		{
			city: 'Vienna',
			rating: '1 open PR',
		},
		{
			city: 'Ermatingen',
			rating: '0 open PR',
		},
		{
			city: 'Lisbon',
			rating: '0 open PR',
		},
	];

	const colors: { [key: string]: Color } = {
		'Ready for dispatch': 'gray',
		Cancelled: 'rose',
		Shipped: 'emerald',
	};

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
						<Tab>Page 2</Tab>
					</TabList>
					<TabPanels>
						<TabPanel>
							<Grid numItemsMd={2} numItemsLg={2} className="gap-6 mt-6">
								<Card className="max-h-[250px] overflow-auto">
									<Flex justifyContent="between" className="mb-3">
										<Title>Technician tasks</Title>
										<Button size="xs" color="green" className="border-0">
											Add technician
										</Button>
									</Flex>
									<List className="pl-0">
										{cities.map((item) => (
											<ListItem key={item.city}>
												<span>{item.city}</span>
												<span>{item.rating}</span>
											</ListItem>
										))}
									</List>
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
									<BarList data={data} className="mt-2" />
								</Card>
							</Grid>
							<div className="mt-6">
								<Card className="h-[450px] overflow-auto">
									<Flex justifyContent="between" className="space-x-2">
										<Flex justifyContent="start">
											<Title className="mr-2">Faults in {user?.designation}</Title>
											<Badge color="red">8</Badge>
										</Flex>
										<DatePicker className="max-w-sm" defaultValue={new Date()} />
									</Flex>

									<Table className="mt-6">
										<TableHead>
											<TableRow>
												<TableHeaderCell>Fault Ref</TableHeaderCell>
												<TableHeaderCell>Report Name</TableHeaderCell>
												<TableHeaderCell>Service</TableHeaderCell>
												<TableHeaderCell>Status</TableHeaderCell>
												<TableHeaderCell>Action fault</TableHeaderCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{transactions.map((item) => (
												<TableRow key={item.transactionID}>
													<TableCell>{item.transactionID}</TableCell>
													<TableCell>{item.user}</TableCell>
													<TableCell>{item.item}</TableCell>
													<TableCell>
														<Badge color={colors[item.status]} size="xs">
															{item.status}
														</Badge>
													</TableCell>
													<TableCell>
														<div className="flex">
															<Select placeholder="Action fault" className="mr-2">
																<SelectItem value="1">Assign technician</SelectItem>
																<SelectItem value="2">Mark as resolved</SelectItem>
																<SelectItem value="3">Close fault</SelectItem>
															</Select>
															<Button size="sm">Apply</Button>
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</Card>
							</div>
						</TabPanel>
					</TabPanels>
				</TabGroup>
			</Container>
		);
	else if (user && user?.isTechnician) return 'technician view';
	else return <NotFound />;
}
