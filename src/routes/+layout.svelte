<script lang="ts">
    import "../app.css";
    import "inter-ui/inter.css";
    import Header from "$lib/components/header.svelte";
    import favicon from "$lib/assets/favicon.svg";
    import { Skeleton } from "$lib/components/ui/skeleton/index.ts";
    import { page } from "$app/state";  import { beforeNavigate, afterNavigate } from '$app/navigation'

    let loading = $state(false)

    beforeNavigate((nav) => {
        loading = true
    })
    afterNavigate(() => {
        loading = false
    })

    let { children } = $props();
</script>

<svelte:head>
    <link href={favicon} rel="icon" />
</svelte:head>

<div class="flex flex-col full-viewport-height">
    <div class="bg-blue-950 w-full shrink-0">
        <Header data={page.data} />
    </div>
    <div class="max-w-md w-full flex-1 mx-auto relative">
        {#if loading}
            <Skeleton class="w-full h-[7%] m-3" />
            <Skeleton class="w-full h-[85%] m-3" />
        {:else}
            {@render children()}
        {/if}
    </div>
</div>
