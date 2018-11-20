import React from "react";
import styled from "styled-components";
import { Container, Columns, Column, Footer, Content } from "bloomer";
import lsLogo1 from "../icons/Logo_ls_1.png";
import lsLogo2 from "../icons/Logo_ls_2.png";

const StyledLogo1 = styled.img`
  width: 30px;
  height: 100%;
  position: relative;
  bottom: -3px;
`;

const StyledLogo2 = styled.img`
  width: 30px;
  position: absolute;
  left: 0px;
  bottom: 0px;

  animation-iteration-count: infinite;
  animation-duration: 0.5s;
  animation-name: flashing;
  animation-direction: alternate;

  @keyframes flashing {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }
`;

const LogoLink = styled.a`
  position: relative;
`;

const Credits = () => (
  <Footer>
    <Container>
      <Content>
        <Columns>
          <Column isSize="full">
            <p>
              Made by{" "}
              <LogoLink
                target="_blank"
                rel="noopener noreferrer"
                href="https://ls-portfolio.surge.sh"
              >
                <StyledLogo1 alt="ls" src={lsLogo1} />
                <StyledLogo2 alt="ls" src={lsLogo2} />
              </LogoLink>
            </p>
          </Column>
        </Columns>
        <Content isSize="small">
          <p>
            This work is licensed under{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://opensource.org/licenses/mit-license.php"
            >
              MIT
            </a>
            .
          </p>
        </Content>
      </Content>
    </Container>
  </Footer>
);

export default Credits;
