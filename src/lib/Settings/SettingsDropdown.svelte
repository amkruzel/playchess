<script lang="ts">
  import DropdownItem from './DropdownItem.svelte'
  import { COLOR_SCHEME } from '../../stores'
  import ColorSchemeIcon from './Icons/ColorSchemeIcon.svelte'
  import ChevronRightIcon from './Icons/ChevronRightIcon.svelte'
  import { currentUser } from '../../pocketbase'
  import { fly } from 'svelte/transition'
  import { currentMenu } from './stores'
  import ChevronLeftIcon from './Icons/ChevronLeftIcon.svelte'
</script>

<article class="dropdown">
  {#if $currentMenu === 'default' || $currentMenu === null}
    <div
      in:fly|local={{ x: -350 }}
      out:fly|local={{ x: -350 }}
      class="orig-menu"
    >
      {#if $currentUser}
        <DropdownItem text={$currentUser.username}>
          <ChevronRightIcon slot="rightIcon" />
        </DropdownItem>
      {:else}
        <DropdownItem text={'Sign In'} />
      {/if}

      <DropdownItem
        text={`${$COLOR_SCHEME === 'light' ? 'Dark' : 'Light'} mode`}
      >
        <ColorSchemeIcon slot="leftIcon" />
      </DropdownItem>
      <DropdownItem text={'Debug'} />
    </div>
  {:else if $currentMenu === 'profile'}
    <div
      in:fly|local={{ x: 350 }}
      out:fly|local={{ x: 350 }}
      class="profile-menu"
    >
      <DropdownItem>
        <ChevronLeftIcon slot="leftIcon" />
      </DropdownItem>
      <DropdownItem text="Sign Out" />
    </div>
  {/if}
</article>

<style>
  .dropdown {
    position: absolute;
    top: 40px;
    width: 300px;
    transform: translateX(-75%);
    overflow: hidden;
    border-radius: 5px;
    padding: 14px 20px;

    display: grid;
  }

  .dropdown > div {
    grid-area: 1 / 1 / 2 / 2;
  }
</style>
