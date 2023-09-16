interface Props {
	url: string;
	data?: Record<string, unknown>;
	method?: 'GET' | 'POST' | 'DELETE' | 'PUT';
	headers?: Record<string, unknown>;
}

export function API({ url, data, method, headers }: Props) {
	return new Promise((resolve, reject) => {
		fetch(url, {
			method: method || 'GET',
			headers: {
				'Content-Type': 'application/json',
				...headers,
			},
			body: data ? JSON.stringify(data) : null,
		})
			.then((response) => {
				return response.json();
			})
			.then((response) => {
				resolve(response);
			})
			.catch((err) => {
				reject(err);
			});
	});
}
