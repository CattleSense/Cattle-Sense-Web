import React from "react";
import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaTrashAlt } from "react-icons/fa";

const DeleteModal = ({ show, onClose, onDelete, itemName, darkMode }) => {
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop="static"
      animation={false}
      style={{ backdropFilter: "blur(3px)" }}
    >
      <Modal.Header
        closeButton
        className={
          darkMode
            ? "bg-dark text-white border-secondary"
            : "bg-light text-dark border-light"
        }
        style={{ padding: "12px" }}
      >
        <Modal.Title style={{ fontSize: "1.2rem" }}>Confirm Delete</Modal.Title>
      </Modal.Header>

      <Modal.Body
        style={{
          backgroundColor: darkMode ? "#343a40" : "#ffffff",
          color: darkMode ? "white" : "black",
          padding: "15px",
          textAlign: "center",
        }}
      >
        <motion.div
          className="d-flex justify-content-center mb-3"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: "loop" }}
        >
          <FaTrashAlt size={45} className="text-danger" /> 
        </motion.div>
        <p style={{ fontSize: "0.95rem", marginBottom: "10px" }}>
          Are you sure you want to <strong>delete</strong>{" "}
          <strong>{itemName}</strong>? This action cannot be undone.
        </p>
      </Modal.Body>

      <Modal.Footer
        style={{
          backgroundColor: darkMode ? "#343a40" : "#ffffff",
          borderTop: darkMode ? "1px solid #454d55" : "1px solid #ced4da",
          padding: "12px",
          justifyContent: "center",
        }}
      >
        <Button variant="secondary" onClick={onClose} size="sm">
          Cancel
        </Button>
        <Button variant="danger" onClick={onDelete} size="sm">
          {" "}
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

DeleteModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  itemName: PropTypes.string.isRequired,
  darkMode: PropTypes.bool.isRequired,
};

export default DeleteModal;
