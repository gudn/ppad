<div>
  <input type="text" />
  <slot name="icon">
    <span />
  </slot>
</div>

<style lang="scss">
  @import '../styles/variables.scss';

  div {
    display: flex;
    flex-direction: row-reverse;
    border: 1px solid rgba(0, 0, 0, 0.3);
    background-color: $primary-color;
    border-radius: 4px;

    input {
      border-color: transparent;
      flex: 1;
      background-color: transparent;
      color: $text-color;
      margin-left: -24px;
      padding: 1px 24px;
      z-index: 1;

      &:active {
        outline-color: $text-color;
      }
    }

    span {
      width: 24px;
    }
  }
</style>
