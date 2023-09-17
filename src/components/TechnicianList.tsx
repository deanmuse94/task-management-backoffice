import { List, ListItem } from '@tremor/react';
import useSWR from 'swr';

interface Props {
	id: number;
	description: string;
	status: 'created' | 'technician_dispatched' | 'resolved' | 'shelved' | 'canceled';
	reported_at: string;
	resoloved_at: string;
	reporter_id: string;
	reporter_name: string;
	reporter_account_nuber: string;
	service_type: 'fibre' | 'ADSL';
	technician_id: string;
}

export default function TechnicianList({ user, faults }: { user: any; faults: any }) {
	const { data, error, isLoading } = useSWR<{
		technicians: {
			admin_name: string;
			email: string;
			id: string;
			is_technician: boolean;
			location: string;
		}[];
	}>(user && { url: `/api/get-technicians?id=${user?.sub}` });

	return (
		<List className="pl-0">
			{data && data.technicians.length === 0 && <p>No data found</p>}
			{data &&
				data.technicians.map((tech, index) => {
					const faultsAssigned = faults && faults.filter((f: any) => f.technician_id === tech.id && f.status === 'technician_dispatched').length;
					return (
						<ListItem key={index}>
							<span>{tech.admin_name}</span>
							<span>{`${faultsAssigned} faults  assigned`}</span>
						</ListItem>
					);
				})}
		</List>
	);
}
