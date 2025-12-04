import { PropsWithoutRef } from "react";

type IconProps = Partial<PropsWithoutRef<SVGElement>> & {
  height?: string | number;
  width?: string | number;
  color?: string;
  className?: string;
  onClick?: () => void;
};

export const DeleteIcon = ({
  height = "24px",
  width = "24px",
  color = "#e3e3e3",
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      height={height}
      width={width}
      fill={color}
    >
      <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
    </svg>
  );
};

export const ProfilePictureIcon = ({
  height = "24px",
  width = "24px",
  color = "#e3e3e3",
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={height}
      viewBox="0 -960 960 960"
      width={width}
      fill={color}
    >
      <path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" />
    </svg>
  );
};

export const EditIcon = ({
  height = "24px",
  width = "24px",
  color = "#e3e3e3",
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={height}
      viewBox="0 -960 960 960"
      width={width}
      fill={color}
    >
      <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
    </svg>
  );
};

export const CommentIcon = ({
  height = "24px",
  width = "24px",
  color = "#e3e3e3",
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={height}
      viewBox="0 -960 960 960"
      width={width}
      fill={color}
    >
      <path d="M240-400h480v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM880-80 720-240H160q-33 0-56.5-23.5T80-320v-480q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v720ZM160-320h594l46 45v-525H160v480Zm0 0v-480 480Z" />
    </svg>
  );
};

export const CloseIcon = ({
  height = "24px",
  width = "24px",
  color = "#e3e3e3",
  className,
  onClick,
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={height}
      viewBox="0 -960 960 960"
      width={width}
      fill={color}
      className={className}
      onClick={onClick}
    >
      <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
    </svg>
  );
};

export const BlockIcon = ({
  height = "24px",
  width = "24px",
  color = "#e3e3e3",
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={height}
      viewBox="0 -960 960 960"
      width={width}
      fill={color}
    >
      <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q54 0 104-17.5t92-50.5L228-676q-33 42-50.5 92T160-480q0 134 93 227t227 93Zm252-124q33-42 50.5-92T800-480q0-134-93-227t-227-93q-54 0-104 17.5T284-732l448 448ZM480-480Z" />
    </svg>
  );
};

export const AddIcon = ({
  height = "24px",
  width = "24px",
  color = "#e3e3e3",
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={height}
      viewBox="0 -960 960 960"
      width={width}
      fill={color}
    >
      <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
    </svg>
  );
};

export const DarkModeIcon = ({
  height = "24px",
  width = "24px",
  color = "#e3e3e3",
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={height}
      viewBox="0 -960 960 960"
      width={width}
      fill={color}
    >
      <path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z" />
    </svg>
  );
};

export const SystemModeIcon = ({
  height = "24px",
  width = "24px",
  color = "#e3e3e3",
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={height}
      viewBox="0 -960 960 960"
      width={width}
      fill={color}
    >
      <path d="M480-540ZM80-160v-80h400v80H80Zm120-120q-33 0-56.5-23.5T120-360v-360q0-33 23.5-56.5T200-800h560q33 0 56.5 23.5T840-720H200v360h280v80H200Zm600 40v-320H640v320h160Zm-180 80q-25 0-42.5-17.5T560-220v-360q0-25 17.5-42.5T620-640h200q25 0 42.5 17.5T880-580v360q0 25-17.5 42.5T820-160H620Zm100-300q13 0 21.5-9t8.5-21q0-13-8.5-21.5T720-520q-12 0-21 8.5t-9 21.5q0 12 9 21t21 9Zm0 60Z" />
    </svg>
  );
};

export const LightModeIcon = ({
  height = "24px",
  width = "24px",
  color = "#e3e3e3",
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={height}
      viewBox="0 -960 960 960"
      width={width}
      fill={color}
    >
      <path d="M480-360q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0 80q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z" />
    </svg>
  );
};

export function PasswordHideIcon({
  width = "16",
  height = "16",
  color = "#B5B5BE",
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.4838 1.50815C14.2437 1.27319 13.8578 1.27531 13.6203 1.51293L11.1774 3.9572C10.2046 3.43632 9.12361 3.15149 8 3.15149C5.18293 3.15149 2.63404 4.94183 1.38547 7.75405C1.31595 7.91063 1.31595 8.08933 1.38547 8.24591C1.94944 9.51616 2.7787 10.5779 3.77815 11.3604L1.51137 13.6284C1.2721 13.8678 1.27428 14.2551 1.5162 14.4918C1.75632 14.7268 2.14219 14.7246 2.37968 14.487L4.82264 12.0428C5.79543 12.5636 6.87638 12.8485 8 12.8485C10.8171 12.8485 13.3659 11.0581 14.6145 8.24591C14.684 8.08933 14.684 7.91063 14.6145 7.75405C14.0506 6.4838 13.2213 5.42203 12.2218 4.63957L14.4886 2.37157C14.7279 2.13218 14.7257 1.74487 14.4838 1.50815ZM10.2732 4.86186C9.56141 4.53773 8.7922 4.36362 8 4.36362C5.7584 4.36362 3.70097 5.7576 2.6078 7.99998C3.10867 9.02739 3.81196 9.8767 4.64264 10.4954L5.90936 9.22802C5.69736 8.86788 5.57575 8.44813 5.57575 7.99998C5.57575 6.66111 6.66112 5.57574 8 5.57574C8.44768 5.57574 8.86702 5.69709 9.22691 5.90869L10.2732 4.86186ZM10.0906 6.77194L11.3573 5.50453C12.188 6.12326 12.8913 6.97257 13.3922 7.99998C12.299 10.2424 10.2416 11.6363 8 11.6363C7.20779 11.6363 6.43858 11.4622 5.72681 11.1381L6.77308 10.0913C7.13297 10.3029 7.55231 10.4242 8 10.4242C9.33887 10.4242 10.4242 9.33885 10.4242 7.99998C10.4242 7.55183 10.3026 7.13208 10.0906 6.77194ZM8.3086 6.8275C8.21007 6.80163 8.10664 6.78786 8 6.78786C7.33056 6.78786 6.78787 7.33054 6.78787 7.99998C6.78787 8.10685 6.80171 8.2105 6.82768 8.30922L8.3086 6.8275ZM7.69139 9.17246L9.17231 7.69074C9.19829 7.78946 9.21212 7.89311 9.21212 7.99998C9.21212 8.66942 8.66943 9.2121 8 9.2121C7.89335 9.2121 7.78992 9.19833 7.69139 9.17246Z"
        fill={color}
      />
    </svg>
  );
}

export function PasswordShowIcon({
  width = "16",
  height = "16",
  color = "#92929D",
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.40666 7.62502C2.63616 4.60547 5.17282 2.66669 8 2.66669C10.8272 2.66669 13.3638 4.60547 14.5933 7.62502C14.6911 7.86512 14.6911 8.13492 14.5933 8.37502C13.3638 11.3946 10.8272 13.3334 8 13.3334C5.17282 13.3334 2.63616 11.3946 1.40666 8.37502C1.30889 8.13492 1.30889 7.86512 1.40666 7.62502ZM8 12.0998C10.2794 12.0998 12.3692 10.5245 13.4333 8.00002C12.3692 5.47552 10.2794 3.90025 8 3.90025C5.72063 3.90025 3.63083 5.47552 2.56672 8.00002C3.63083 10.5245 5.72063 12.0998 8 12.0998ZM8 10.4309C6.68082 10.4309 5.61141 9.34254 5.61141 8.00002C5.61141 6.6575 6.68082 5.56918 8 5.56918C9.31918 5.56918 10.3886 6.6575 10.3886 8.00002C10.3886 9.34254 9.31918 10.4309 8 10.4309ZM8 9.1973C8.64975 9.1973 9.17647 8.66126 9.17647 8.00002C9.17647 7.33878 8.64975 6.80274 8 6.80274C7.35025 6.80274 6.82353 7.33878 6.82353 8.00002C6.82353 8.66126 7.35025 9.1973 8 9.1973Z"
        fill={color}
      />
    </svg>
  );
}

export function PlaceholderImageIcon({
  width = "24",
  height = "24",
  color = "#e3e3e3",
  className,
}: IconProps & { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={height}
      viewBox="0 -960 960 960"
      width={width}
      fill={color}
      className={className}
    >
      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z" />
    </svg>
  );
}

const chevronDirection = {
  default: "",
  top: "90",
  right: "180",
  bottom: "-90",
};

export function ChevronIcon({
  width = "24",
  height = "24",
  color = "#e3e3e3",
  direction = "default",
}: IconProps & { direction?: keyof typeof chevronDirection }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      fill={color}
      className="inline-block shrink-0"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: `rotate(${chevronDirection[direction]}deg)`,
        transition: "transform 0.2s ease",
      }}
    >
      <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" />
    </svg>
  );
}
