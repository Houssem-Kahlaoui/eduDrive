package tn.enicarthage.eduDrive.service;

import tn.enicarthage.eduDrive.dao.AdminDAO;
import tn.enicarthage.eduDrive.dao.UtilisateurDAO;
import tn.enicarthage.eduDrive.exception.ConflictException;
import tn.enicarthage.eduDrive.exception.ResourceNotFoundException;
import tn.enicarthage.eduDrive.model.Admin;
import tn.enicarthage.eduDrive.util.PasswordUtil;

import java.util.List;

public class AdminService {
    private final AdminDAO dao = new AdminDAO();
    private final UtilisateurDAO utilisateurDAO = new UtilisateurDAO();

    public List<Admin> getAll() { return dao.findAll(); }

    public Admin getById(Long id) {
        Admin a = dao.findById(id);
        if (a == null) throw new ResourceNotFoundException("Admin introuvable : " + id);
        return a;
    }

    // ✅ create() a été supprimée

    public void update(Long id, Admin a) {
        Admin existant = getById(id);

        // Vérifier si l'email a changé et s'il n'est pas déjà pris
        if (!existant.getEmail().equals(a.getEmail())) {
            if (utilisateurDAO.findByEmail(a.getEmail()) != null) {
                throw new ConflictException("Un autre utilisateur avec cet email existe déjà.");
            }
        }

        // On hash le mot de passe seulement s'il a été modifié et qu'il n'est pas vide
        if (a.getMotDePasse() != null
                && !a.getMotDePasse().isEmpty()
                && !a.getMotDePasse().equals(existant.getMotDePasse())) {
            a.setMotDePasse(PasswordUtil.hash(a.getMotDePasse()));
        }

        a.setId(id);
        dao.update(a);
    }

    // ✅ delete() a été supprimée
}