interface Props {
	first_name: string;
	fault_id: string;
}

export default function EmailTemplate({ first_name, fault_id }: Props): JSX.Element {
	return (
		<>
			<p>Hi {first_name}</p>
			<p>
				A technician has been dispatched to your premises and they will contact you upon arrive.
				<br />
				<br />
				Kind Regards
			</p>
		</>
	);
}
