<script lang="ts">
    import "../app.css";
    import "inter-ui/inter.css";
    import Header from "$lib/components/header.svelte";
    import favicon from "$lib/assets/favicon.svg";
    import { page } from "$app/state";

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<div class="flex flex-col h-screen">
    <div class="bg-blue-950 w-full shrink-0">
        <Header data={page.data} />
    </div>
    <div class="max-w-md w-full flex-1 mx-auto relative">
        {@render children()}
    </div>
</div>
