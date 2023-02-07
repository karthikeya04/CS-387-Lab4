import styled, { css } from "styled-components";

export const CenterV = css`
  display: flex;
  align-items: center;
`;

export const CenterH = css`
  display: flex;
  justify-content: center;
  margin-top:50px
`;

export const CenterVH = css`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Center = styled.div`
  /* This is an example of a nested interpolation */
  ${props => (props.V ? CenterV : "")}
  ${props => (props.H ? CenterH : "")}
`;
