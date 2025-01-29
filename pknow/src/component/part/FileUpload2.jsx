import { forwardRef } from "react";
import { FILE_LINK } from "../util/Constants";

const FileUpload = forwardRef(function FileUpload(
  {
    formatFile = "",
    label = "",
    forInput = "",
    isRequired = false,
    isDisabled = false,
    errorMessage,
    hasExisting,
    maxFileSize = 10, // Default 10 MB
    ...props
  },
  ref
) {
  return (
    <div style={{ textAlign: "left", marginBottom: "20px" }}>
      <label
        htmlFor={forInput}
        style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "10px", display: "block" }}
      >
        {label}
        {isRequired && <span style={{ color: "red" }}> *</span>}
      </label>

      {!isDisabled && (
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <label
            htmlFor={forInput}
            style={{
              display: "inline-block",
              backgroundColor: "#3182CE",
              color: "white",
              borderRadius: "5px",
              padding: "8px 16px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Upload Foto Baru
          </label>
          <input
            type="file"
            id={forInput}
            name={forInput}
            accept={formatFile}
            ref={ref}
            style={{ display: "none" }}
            {...props}
            required={isRequired}
          />
          {hasExisting && (
            <p style={{ marginTop: "10px", fontSize: "12px", color: "#4A5568" }}>
              Berkas saat ini:{" "}
              <a
                href={FILE_LINK + hasExisting}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#1D4ED8",
                  textDecoration: "underline",
                }}
              >
                Unduh Berkas
              </a>
            </p>
          )}
        </div>
      )}

      {errorMessage && (
        <p style={{ fontSize: "12px", color: "red", marginTop: "5px" }}>
          {errorMessage}
        </p>
      )}
    </div>
  );
});

export default FileUpload;
