import { createFileRoute } from "@tanstack/react-router";
import { GlobeDemo } from "@/components/globe-demo";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<div className="flex flex-row items-center justify-center py-20 h-screen md:h-auto dark:bg-black bg-white relative w-full">
			<div className="max-w-7xl mx-auto w-full relative overflow-hidden h-full md:h-[40rem] px-4">
				<h2 className="text-center text-xl md:text-4xl font-bold text-black dark:text-white">
					Travel around the world
				</h2>
				<p className="text-center text-base md:text-lg font-normal text-neutral-700 dark:text-neutral-200 max-w-md mt-2 mx-auto">
					Find your next destination and start planning your trip.
				</p>
				<div className="absolute w-full bottom-0 inset-x-0 h-10 bg-gradient-to-b pointer-events-none select-none from-transparent dark:to-black to-white z-40" />
				<div className="absolute -bottom-20 h-[500px] w-[500px] md:h-[600px] md:w-[600px] left-1/2 -translate-x-1/2 z-10">
					<GlobeDemo />
				</div>
			</div>
		</div>
	);
}
