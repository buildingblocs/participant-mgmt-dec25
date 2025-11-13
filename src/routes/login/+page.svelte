<script lang="ts">
    import { SignIn } from "@auth/sveltekit/components";
    import Button from "$lib/components/button.svelte";
    import Enter from "$lib/components/icons/enter.svelte";
</script>

<div class="flex flex-col sm:flex-row gap-5 m-5">
    <SignIn provider="github" signInPage="login" className="w-full">
        <div slot="submitButton" class="w-full cursor-pointer">
            <Button text="GitHub">
                <Enter />
            </Button>
        </div>
    </SignIn>
</div>
