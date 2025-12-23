<script lang="ts">
	import type { PageProps } from './$types';
	import * as Select from "$lib/components/ui/select/index.js";
	import emblaCarouselSvelte from 'embla-carousel-svelte'
	import { enhance } from "$app/forms";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Item from "$lib/components/ui/item/index.js";
	import Person from "$lib/components/icons/person.svelte";
	import Envelope from "$lib/components/icons/envelope-closed.svelte";
	import ArrowRight from "$lib/components/icons/arrow-right.svelte";
	import Pencil from "$lib/components/icons/pencil.svelte";
	import Check from "$lib/components/icons/check-circled.svelte";
	import Exclamation from "$lib/components/icons/exclamation-triangle.svelte";
	import 'flowbite';

	let { data, form }: PageProps = $props();
	let workshop = $state<string>("Workshop Name");
	let left = $state<string[]>([]);
	let marking = $state<boolean>(false);
	let emblaApi;
	let searchTerm = $state<string>("");
	let filteredUsers = $state<string[]>([]);
	let usrList = $state<string[]>([]);
	let selectedName = $state<string>("");
	let markRes = $state<boolean>(false);
	let manMarkDone = $derived(left.length > 0 && left.every(p => p.done == true))

	function onInit(event) {
		emblaApi = event.detail
		console.log(emblaApi.slideNodes()) // Access API
	}

	function scroll(next: boolean) {
		filteredUsers = usrList
		if (next) {
			emblaApi.scrollNext();
		} else {
			emblaApi.scrollPrev();
		}
	}

	const search = (e) => {
		searchTerm = e.target.value
		const term = searchTerm.toLowerCase();
		filteredUsers = usrList.filter((user) =>
				user[0].toLowerCase().includes(term) ||
				user[1].toLowerCase().includes(term) ||
				user[2].toLowerCase().includes(term)
		);
	}
</script>
{#if marking}
	<div class="bg-blue-100 rounded-xl w-full p-3 h-40 justify-center flex flex-col gap-1 mt-3">
		<Pencil color="#1E3A8A" size="30" />
		<h2 class="text-2xl font-semibold text-blue-900">Marking Attendance</h2>
	</div>
{:else if markRes || manMarkDone == true}
	<div class="bg-blue-100 rounded-xl w-full p-3 h-40 justify-center flex flex-col gap-1 mt-3">
		<Check color="#1E3A8A" size="30" />
		<h2 class="text-2xl font-semibold text-blue-900">Attendance Marked Sucessfully!</h2>
	</div>
{:else if left && left.length > 0 && manMarkDone == false}
	<div class="bg-blue-100 rounded-xl w-full p-3 justify-center flex flex-col gap-1 mt-3">
		<div class="flex gap-2 items-center">
			<Exclamation colour="#1E3A8A" size="20" />
			<h2 class="text-xl font-semibold text-blue-900">User Intervention Required</h2>
		</div>

		<div class="embla" use:emblaCarouselSvelte onemblaInit={onInit}>
			<div class="embla__container">
				{#each left as participant}
					{#if participant.done}
						ok!
					{:else}
						<form class="embla__slide" use:enhance={() => {
							return async ({ update }) => {
								await update({ reset: false });
								if (!form?.errorMsg) {
									participant.done = true;
								}
							};
						}} action="?/markSpecific" method="POST">
							<Input readonly name="uploadedName" value={participant.name} />
							<Input oninput={search} placeholder="Search an email or name..." />
							<input name="sheetName" type="hidden" value={selectedName} />
							<input name="workshop" type="hidden" value={workshop} />
							{#each filteredUsers as registeredParticipant}
								<button>
									<Item.Root variant="muted" onclick={() => (selectedName = registeredParticipant[0])}>
										<Item.Content>
											<Item.Title>{registeredParticipant[0]}</Item.Title>
											<Item.Description class="flex gap-3">
												<div class="flex gap-1 items-center">
													<Person />
													{registeredParticipant[1]}
												</div>
												<div class="flex gap-1 items-center">
													<Envelope />
													{registeredParticipant[2]}
												</div>
											</Item.Description>
										</Item.Content>
									</Item.Root>
								</button>
							{/each}
						</form>
					{/if}
				{/each}
			</div>
		</div>
		<button onclick={() => scroll(true)}>Next</button>
		<button onclick={() => scroll(false)}>Back</button>
	</div>
{:else}
	<form
		action="?/mark"
		enctype="multipart/form-data"
		method="POST"
		class="my-3 flex flex-col gap-3"
		use:enhance={() => {
			marking = true;
			return async ({ result, update }) => {
				await update({ reset: false });
				marking = false;
				if (result?.data.left) {
					left = [...result.data.left];
				}
				if (result?.data.list) {
					usrList = result.data.list;
					filteredUsers = result.data.list;
				}
				if (result.data.state === 'success') {
					markRes = true;
				}
			};
		}}
	>
		<div class="flex flex-col gap-1">
			<p class="font-medium">Google Meet Attendance Record</p>
			<input class="cursor-pointer  border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full shadow-xs placeholder:text-body" name="file" type="file">
		</div>

		<div class="flex flex-col gap-1">
			<p class="font-medium">Select Workshop</p>
			<Select.Root bind:value={workshop} name="workshop" type="single" >
				<Select.Trigger class="cursor-pointer">{workshop}</Select.Trigger>
				<Select.Content>
					{#each data.workshops as workshop}
						<Select.Item value={workshop}>{workshop}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
		<button class="transition cursor-pointer bg-blue-50 py-1 flex items-center justify-center rounded-md border border-black/5 shadow-xs hover:bg-blue-100">
			Submit
			<ArrowRight size="20" />
		</button>
	</form>
{/if}

{#if form?.errorMsg}
	<Item.Root variant="outline">
		<Item.Content>
			<Item.Title>
				<Exclamation colour="#7F1D1D" size="20" />
				<h2 class="text-xl font-semibold text-red-900">Error</h2>
			</Item.Title>
			<Item.Description>
				{form?.errorMsg}
			</Item.Description>
		</Item.Content>
	</Item.Root>
{/if}

<style>
	.embla {
		overflow: hidden;
	}
	.embla__container {
		display: flex;
	}
	.embla__slide {
		flex: 0 0 100%;
		min-width: 0;
	}
	.embla__slide__number {
		box-shadow: inset 0 0 0 0.2rem var(--detail-medium-contrast);
		border-radius: 1.8rem;
		font-size: 4rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		height: var(--slide-height);
		user-select: none;
	}
	.embla__controls {
		display: grid;
		grid-template-columns: auto 1fr;
		justify-content: space-between;
		gap: 1.2rem;
		margin-top: 1.8rem;
	}
	.embla__buttons {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.6rem;
		align-items: center;
	}
	.embla__button {
		-webkit-tap-highlight-color: rgba(var(--text-high-contrast-rgb-value), 0.5);
		-webkit-appearance: none;
		appearance: none;
		background-color: transparent;
		touch-action: manipulation;
		display: inline-flex;
		text-decoration: none;
		cursor: pointer;
		border: 0;
		padding: 0;
		margin: 0;
		box-shadow: inset 0 0 0 0.2rem var(--detail-medium-contrast);
		width: 3.6rem;
		height: 3.6rem;
		z-index: 1;
		border-radius: 50%;
		color: var(--text-body);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.embla__button:disabled {
		color: var(--detail-high-contrast);
	}
	.embla__button__svg {
		width: 35%;
		height: 35%;
	}
	.embla__dots {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		align-items: center;
		margin-right: calc((2.6rem - 1.4rem) / 2 * -1);
	}
	.embla__dot {
		-webkit-tap-highlight-color: rgba(var(--text-high-contrast-rgb-value), 0.5);
		-webkit-appearance: none;
		appearance: none;
		background-color: transparent;
		touch-action: manipulation;
		display: inline-flex;
		text-decoration: none;
		cursor: pointer;
		border: 0;
		padding: 0;
		margin: 0;
		width: 2.6rem;
		height: 2.6rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
	}
	.embla__dot:after {
		box-shadow: inset 0 0 0 0.2rem var(--detail-medium-contrast);
		width: 1.4rem;
		height: 1.4rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		content: '';
	}
	.embla__dot--selected:after {
		box-shadow: inset 0 0 0 0.2rem var(--text-body);
	}

</style>
