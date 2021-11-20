<ul class="dropdown">
  <slot />
</ul>

<style lang="scss">
  @import '../styles/variables.scss';

  $border-color: change-color($text-color, $alpha: 0.3);

  .dropdown {
    border: 1px solid $border-color;
    border-radius: 4px;
    display: flex;

    list-style-type: none;
    margin: 0;
    padding: 0;

    :global(li) {
      padding: 8px;
      position: relative;

      :global(ul) {
        border: 1px solid $border-color;
        border-radius: 4px;
        background-color: $primary-color;

        display: none;

        left: 0;
        position: absolute;
        top: 100%;

        list-style-type: none;
        margin: 0;
        margin-top: 0.1em;
        padding: 0;

        width: 200px;

        & > :global(li):not(:first-child) {
          border-top: 1px solid $border-color;
        }

        :global(ul) {
          left: 100%;
          position: absolute;
          top: 0;

          margin-top: 0;
          margin-left: 0.1em;
        }

        :global(li:hover) {
          background-color: adjust-color($primary-color, $lightness: 5%);
        }
      }
    }

    & > :global(li):not(:first-child) {
      border-left: 1px solid $border-color;
    }

    :global(li:hover > ul) {
      display: block;
    }

    & > :global(li:hover) {
      background-color: $primary-color;
    }
  }
</style>
