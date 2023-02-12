import "./styles/Login.css"
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col, Image } from "react-bootstrap";
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



function Login(){
    let navigate = useNavigate()
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    useEffect(()=>{
      axios
      .post("/login","",{})
      .then(res=>res.data.isAuthenticated?navigate("/home"):"")
      .catch(err=>console.log(err))
  });  
    const handleSubmit = (event) => {
        event.preventDefault();
        const credentials = {"userid":userid,"password":password};
        axios
            .post("/login",credentials,{})
            .then(res=>{res.data.isAuthenticated?navigate("/home"):toast.error("Wrong Password")})
            .catch(err=>console.log(err))          
        
    };
  
    return (
      <>
          <ToastContainer 
                autoClose={1000}
            />
      <Container className="mt-5 flex-center main-container">
        <Row className="justify-content-center">
          <Col md={5}>
            {/* <Image src={logo} className="mb-4" fluid /> */}
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formBasicEmail">
                <Form.Control className="form-row"
                  type="text"
                  placeholder="User-ID"
                  value={userid}
                  onChange={(event) => setUserid(event.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formBasicPassword">
                <Form.Control className="form-row"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit" block>
                Submit
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
      </>
    );

}

export default Login;