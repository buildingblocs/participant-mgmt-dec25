<script lang="ts">
    let { children, text } = $props();
</script>

<div
    class="bg-blue-100 w-full flex items-center justify-center gap-3 p-1 tracking-tight rounded-md"
>
    {@render children()}
    {text}
</div>
