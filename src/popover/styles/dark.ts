import { commonDark } from '../../_styles/common'
import commonVariables from './_common'
import type { PopoverTheme } from './light'

const popoverDark: PopoverTheme = {
  name: 'Popover',
  common: commonDark,
  self (vars) {
    const {
      popoverColor,
      textColor2Overlay,
      boxShadow2,
      borderRadius,
      fontSize
    } = vars
    return {
      ...commonVariables,
      fontSize,
      borderRadius,
      color: popoverColor,
      textColor: textColor2Overlay,
      boxShadow: boxShadow2
    }
  }
}

export default popoverDark
