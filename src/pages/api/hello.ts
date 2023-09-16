// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { CognitoIdentityProviderClient, AdminCreateUserCommand } from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { first_name, last_name, email, role, designation } = req.body;

	const input = {
		UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
		Username: email,
		UserAttributes: [
			{
				Name: 'address',
				Value: '',
			},
			{
				Name: 'given_name',
				Value: first_name,
			},
			{
				Name: 'family_name',
				Value: last_name,
			},
			{
				Name: 'custom:account_number',
				Value: '',
			},
			{
				Name: 'custom:is_admin',
				Value: role === 'admin' ? '1' : '0',
			},
			{
				Name: 'custom:is_superuser',
				Value: role === 'super_user' ? '1' : '0',
			},
			{
				Name: 'custom:is_technician',
				Value: role === 'technician' ? '1' : '0',
			},
			{
				Name: 'custom:designation',
				Value: !!designation ? designation : '',
			},
		],
		DesiredDeliveryMediums: ['EMAIL'],
	};

	const command = new AdminCreateUserCommand(input);
	try {
		const response = await client.send(command);

		res.status(200).json({ response });
	} catch (error) {
		return res.status(500).json({ error, message: 'Something went wrong, please try again' });
	}
}
