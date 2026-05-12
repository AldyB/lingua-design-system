/**
 * Custom Style Dictionary transform: boxShadow array → CSS box-shadow string.
 * Input:  [{ x, y, blur, spread, color, type }]
 * Output: "0 8px 32px -4px rgba(0,0,0,0.25)"
 */
export const shadowTransform = {
  name: 'lingua/shadow-css',
  type: 'value',
  filter: (token) => token.type === 'boxShadow',
  transform: (token) => {
    const shadows = Array.isArray(token.value) ? token.value : [token.value];
    return shadows
      .map(({ x, y, blur, spread, color }) =>
        [x, y, blur, spread, color].filter(Boolean).join(' ')
      )
      .join(', ');
  },
};
