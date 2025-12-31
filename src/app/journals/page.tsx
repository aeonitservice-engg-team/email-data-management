'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/layout';
import {
  Button,
  Card,
  CardContent,
  Input,
  Select,
  Modal,
  Badge,
  Spinner,
  useToast,
  ConfirmModal,
} from '@/components/ui';
import { useData } from '@/contexts/DataContext';
import { formatDate, formatNumber, debounce } from '@/lib/utils';
import styles from './page.module.css';

/**
 * Brand interface
 */
interface Brand {
  id: string;
  name: string;
  code: string;
  status: 'ACTIVE' | 'INACTIVE';
}

/**
 * Journal interface
 */
interface Journal {
  id: string;
  name: string;
  issn: string | null;
  brandId: string;
  brand: {
    id: string;
    name: string;
    code: string;
  };
  subject: string | null;
  frequency: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  contactCount: number;
}

/**
 * Form data interface
 */
interface JournalFormData {
  name: string;
  issn: string;
  brandId: string;
  subject: string;
  frequency: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const initialFormData: JournalFormData = {
  name: '',
  issn: '',
  brandId: '',
  subject: '',
  frequency: '',
  status: 'ACTIVE',
};

/**
 * Journals Page
 * 
 * Manages journals with CRUD operations.
 */
export default function JournalsPage() {
  const { addToast } = useToast();
  const { brands: cachedBrands, journals: cachedJournals, fetchStats, lastFetched } = useData();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [formData, setFormData] = useState<JournalFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-fetch if no cached data exists
  useEffect(() => {
    if (!lastFetched) {
      fetchStats();
    }
  }, [lastFetched, fetchStats]);

  // Use cached brands
  useEffect(() => {
    if (cachedBrands.length > 0) {
      setBrands(cachedBrands as Brand[]);
    }
  }, [cachedBrands]);

  // Filter and paginate cached journals
  useEffect(() => {
    if (cachedJournals.length === 0) {
      setJournals([]);
      setTotal(0);
      setTotalPages(1);
      setLoading(false);
      return;
    }

    // Apply filters
    let filtered = [...cachedJournals] as Journal[];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.name.toLowerCase().includes(searchLower) ||
          j.issn?.toLowerCase().includes(searchLower) ||
          j.subject?.toLowerCase().includes(searchLower)
      );
    }

    if (brandFilter) {
      filtered = filtered.filter((j) => j.brandId === brandFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter((j) => j.status === statusFilter);
    }

    // Calculate pagination
    const itemsPerPage = 10;
    const totalCount = filtered.length;
    const totalPagesCount = Math.ceil(totalCount / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedJournals = filtered.slice(startIndex, endIndex);

    setJournals(paginatedJournals);
    setTotal(totalCount);
    setTotalPages(totalPagesCount || 1);
    setLoading(false);
  }, [cachedJournals, search, brandFilter, statusFilter, page]);

  /**
   * Debounced search handler
   */
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearch(value);
      setPage(1);
    }, 300),
    [],
  );

  /**
   * Handle form input changes
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Open modal for creating a new journal
   */
  const handleAddNew = () => {
    setSelectedJournal(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  /**
   * Open modal for editing a journal
   */
  const handleEdit = (journal: Journal) => {
    setSelectedJournal(journal);
    setFormData({
      name: journal.name,
      issn: journal.issn || '',
      brandId: journal.brandId,
      subject: journal.subject || '',
      frequency: journal.frequency || '',
      status: journal.status,
    });
    setIsModalOpen(true);
  };

  /**
   * Open delete confirmation modal
   */
  const handleDeleteClick = (journal: Journal) => {
    setSelectedJournal(journal);
    setIsDeleteModalOpen(true);
  };

  /**
   * Save journal (create or update)
   */
  const handleSave = async () => {
    if (!formData.name.trim()) {
      addToast('Journal name is required', 'error');
      return;
    }

    if (!formData.brandId) {
      addToast('Brand is required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const url = selectedJournal
        ? `/api/journals/${selectedJournal.id}`
        : '/api/journals';
      const method = selectedJournal ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save journal');
      }

      addToast(
        selectedJournal ? 'Journal updated successfully' : 'Journal created successfully',
        'success',
      );
      setIsModalOpen(false);
      // Refresh data from server
      fetchStats();
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to save journal', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Delete journal
   */
  const handleDelete = async () => {
    if (!selectedJournal) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/journals/${selectedJournal.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete journal');
      }

      addToast('Journal deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      // Refresh data from server
      fetchStats();
    } catch (error) {
      addToast('Failed to delete journal', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Header
        title="Journals"
        description={`Manage your academic journals (${formatNumber(total)} total)`}
        actions={
          <Button onClick={handleAddNew}>
            <svg className={styles.buttonIcon} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Journal
          </Button>
        }
      />

      {/* Filters */}
      <Card noPadding>
        <div className={styles.filters}>
          <Input
            placeholder="Search journals..."
            onChange={(e) => debouncedSearch(e.target.value)}
            leftIcon={
              <svg className={styles.searchIcon} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            }
          />
          <Select
            options={[
              { value: '', label: 'All Brands' },
              ...brands.map((brand) => ({
                value: brand.id,
                label: brand.name,
              })),
            ]}
            value={brandFilter}
            onChange={(e) => {
              setBrandFilter(e.target.value);
              setPage(1);
            }}
          />
          <Select
            options={[
              { value: '', label: 'All Status' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className={styles.loading}>
            <Spinner size="lg" />
          </div>
        ) : journals.length === 0 ? (
          <div className={styles.empty}>
            <p>No journals found</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>Status</th>
                  <th>Contacts</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {journals.map((journal) => (
                  <tr key={journal.id}>
                    <td>
                      <div className={styles.journalName}>
                        <p>{journal.name}</p>
                        {journal.issn && (
                          <span className={styles.issn}>ISSN: {journal.issn}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge variant={journal.brand.code === 'GMX' ? 'primary' : 'secondary'}>
                        {journal.brand.name}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={journal.status === 'ACTIVE' ? 'success' : 'warning'}>
                        {journal.status}
                      </Badge>
                    </td>
                    <td>{formatNumber(journal.contactCount)}</td>
                    <td>{formatDate(journal.createdAt)}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.actionButton}
                          onClick={() => handleEdit(journal)}
                          aria-label="Edit journal"
                        >
                          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          className={styles.actionButtonDanger}
                          onClick={() => handleDeleteClick(journal)}
                          aria-label="Delete journal"
                        >
                          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedJournal ? 'Edit Journal' : 'Add New Journal'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={isSaving}>
              {selectedJournal ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <div className={styles.form}>
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter journal name"
            fullWidth
          />
          <Input
            label="ISSN"
            name="issn"
            value={formData.issn}
            onChange={handleInputChange}
            placeholder="e.g., 1234-5678"
            fullWidth
          />
          <Select
            label="Brand"
            name="brandId"
            value={formData.brandId}
            onChange={handleInputChange}
            options={[
              { value: '', label: 'Select a brand' },
              ...brands.map((brand) => ({
                value: brand.id,
                label: brand.name,
              })),
            ]}
            fullWidth
          />
          <Input
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="e.g., Computer Science"
            fullWidth
          />
          <Input
            label="Frequency"
            name="frequency"
            value={formData.frequency}
            onChange={handleInputChange}
            placeholder="e.g., Monthly, Quarterly"
            fullWidth
          />
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]}
            fullWidth
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Journal"
        message={`Are you sure you want to delete "${selectedJournal?.name}"? This will also delete all associated contacts. This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </>
  );
}
