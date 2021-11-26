<script lang="ts">
  import type { PCell } from '../../models/cells'

  export let cell: PCell
</script>

<div class="outer">
  <div class="inner">
    <button>
      <span class="icon arrow-up" />
      <span class="label">Up</span>
    </button>
    <button>
      <span class="icon arrow-down" />
      <span class="label">Down</span>
    </button>
    <button class="click-handler delete-cell" data-key={cell.key}>
      <span class="icon trash" />
      <span class="label">Delete</span>
    </button>
  </div>
</div>

<style lang="scss">
  @import '../../styles/variables.scss';

  .outer {
    position: absolute;
    top: 0;
    right: 1em;
    min-height: 1.5em;
    min-width: 10vw;

    &:hover .inner {
      display: flex !important;
    }
  }


  .inner {
    border-radius: 4px;

    position: relative;
    top: -1em;

    height: 1em;

    display: none;
    justify-content: center;
    align-items: center;

    button {
      background-color: $primary-color;
      color: $text-color;
      border: 1px solid $border-color;
      border-left: none;

      display: flex;
      align-items: center;
      flex-direction: row;
      justify-content: center;

      padding: 2px 5px;

      .icon {
        &.arrow-up {
          background-image: url('/icons/arrow-up.svg');
        }

        &.arrow-down {
          background-image: url('/icons/arrow-down.svg');
        }

        &.trash {
          background-image: url('/icons/trash.svg');
        }

        background-size: 14px 14px;
        min-width: 14px;
        min-height: 14px;
        filter: invert(93.3%);
        margin-right: 0.3em;
      }

      .label {
        margin-top: 2px;
      }

      &:hover, &:focus {
        background-color: $hover-color;
      }

      &:first-child {
        border-left: 1px solid $border-color;
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
      }

      &:last-child {
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
      }
    }
  }
</style>
