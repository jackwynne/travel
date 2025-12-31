import { useEffect, useState } from "react";

type DevtoolsModules = {
	TanStackDevtools: typeof import("@tanstack/react-devtools").TanStackDevtools;
	TanStackRouterDevtoolsPanel: typeof import("@tanstack/react-router-devtools").TanStackRouterDevtoolsPanel;
	ReactQueryDevtoolsPanel: typeof import("@tanstack/react-query-devtools").ReactQueryDevtoolsPanel;
};

export default function ClientDevtools() {
	const [mods, setMods] = useState<DevtoolsModules | null>(null);

	useEffect(() => {
		if (!import.meta.env.DEV) return;

		let cancelled = false;

		Promise.all([
			import("@tanstack/react-devtools"),
			import("@tanstack/react-router-devtools"),
			import("@tanstack/react-query-devtools"),
		]).then(([reactDevtools, routerDevtools, queryDevtools]) => {
			if (cancelled) return;
			setMods({
				TanStackDevtools: reactDevtools.TanStackDevtools,
				TanStackRouterDevtoolsPanel: routerDevtools.TanStackRouterDevtoolsPanel,
				ReactQueryDevtoolsPanel: queryDevtools.ReactQueryDevtoolsPanel,
			});
		});

		return () => {
			cancelled = true;
		};
	}, []);

	// Never render devtools on the server.
	if (typeof window === "undefined") return null;
	if (!import.meta.env.DEV) return null;
	if (!mods) return null;

	const {
		TanStackDevtools,
		TanStackRouterDevtoolsPanel,
		ReactQueryDevtoolsPanel,
	} = mods;

	return (
		<TanStackDevtools
			config={{
				position: "bottom-right",
			}}
			plugins={[
				{
					name: "Tanstack Router",
					render: <TanStackRouterDevtoolsPanel />,
				},
				{
					name: "Tanstack Query",
					render: <ReactQueryDevtoolsPanel />,
				},
			]}
		/>
	);
}
