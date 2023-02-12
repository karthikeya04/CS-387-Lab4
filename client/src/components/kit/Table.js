import React from "react";
import styled from "styled-components";
import { register } from "../Registration";
import { drop } from "../Home";
import { Link } from 'react-router-dom';

const StyledTable = styled.table`
  caption-side: top;
  border: none;
  border-collapse: collapse;
  /* border-collapse: separate; */
  /* border-spacing: 5px 10px; */

  caption-side: bottom;
  /* empty-cell: show | hide;  */
  /* empty-cell is a property of table or the cells themselves */

  /* vertical-align: baseline | sub | super | text-top | 
                text-bottom | middle | top | bottom | 
                <percentage> | <length> */

  /* tbody {
    vertical-align: top;
  }              */
  td,
  th {
    border: none;
  }
  /* td,
  th {
    border: 1px solid;
  } */

  td {
    padding: 20px 20px;
  }

  tbody tr {
    :nth-of-type(odd) {
      background-color: #efefef;
    }
    :hover {
      background-color: lightpink;
    }
  }
  thead > tr {
    background-color: #c2c2c2;
  }
  caption {
    font-size: 0.9em;
    padding: 5px;
    font-weight: bold;
  }
`;
function Td({ children, to ,semd}) {
  // Conditionally wrapping content into a link
  const ContentTag = to ? Link : 'div';

  return (
    <td style={{whiteSpace:'pre'}} >
      <ContentTag to={to}>{children}</ContentTag>
    </td>
  );
};

export default ({ data,caption,button }) => (
  <TableMarkup titles={Object.keys(data[0])} data={data} caption={caption} button={button} />
);

const TableMarkup = ({ titles, data ,caption,button}) => (
  <StyledTable>
    <caption>{caption}</caption>
    <colgroup>
      <col />
      <col />
      <col />
    </colgroup>
    <>
      <thead>

      <tr>
        {titles.map((title, index) => (
          title!=="link"?<th key={index}>{title}</th>:""
        ))}
      </tr>
    </thead>
    <tbody>
      {data.map((item, index) => (
        <>  
        <tr key={index}>
          {titles.map((title, idx) => (
            (title!=="link") ?
            (title==="Register"||title==="Drop")? <td key={idx}><input type="button" value={title} onClick={()=>{title==="Register"?register(item):drop(item)}}/></td> : 
            ["course_id","title","id","Name","department"].includes(title)&&item["link"] ? <Td to={`${item["link"]}`} key={idx}>{item[title]}</Td> : 
            <Td key={idx}>{item[title]}</Td>
            : ""
          ))}
        </tr>
        </>
      ))}
    </tbody>
    </>
    {/* <tfoot>
      <tr>
        {titles.map((title, index) => (
          <th key={index}>{title}</th>
        ))}
      </tr>
    </tfoot> */}
  </StyledTable>
);
