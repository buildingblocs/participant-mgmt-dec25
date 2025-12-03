<script lang="ts">
    import type { LayoutProps } from "./$types";
    import { SignOut } from "@auth/sveltekit/components";
    import Back from "$lib/components/back.svelte";
    import Exit from "$lib/components/icons/exit.svelte";

    let { data }: LayoutProps = $props();
</script>

<div
    class="bg-blue-950 text-white flex flex-col h-40 min-h-40 justify-between p-5 max-w-md w-full mx-auto"
>
    {#if data.header.back}
        <div class="flex items-center justify-between">
            <Back />
        </div>
    {:else if data.header.info == null}
        <div class="flex items-center justify-between w-full">
            <p class="text-sm tracking-tight text-blue-100">
                Logged in as {data.session.user.name}
            </p>
            <SignOut signOutPage="logout">
                <div slot="submitButton">
                    <Exit />
                </div>
            </SignOut>
        </div>
    {:else}
        <div class="flex items-center justify-between w-full">
            <p class="text-sm tracking-tight text-blue-100">
                BuildingBloCS Dec Conf 25
            </p>
        </div>
    {/if}

    <h1 class="text-xl font-bold">{@html data.header.heading}</h1>
</div>
